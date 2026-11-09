import { Injectable, Logger } from '@nestjs/common';
import { AuditAction, EmployeeStatus, Prisma } from '@generated/prisma/client';
import { ConfigService } from '@nestjs/config';

import { AuditCommandService } from '@/audit';
import {
  BadGatewayAppException,
  BadRequestAppException,
  NotFoundAppException,
} from '@/common/exceptions';
import { decryptSecret, deriveEncryptionKey, encryptSecret } from '@/iam/crypto/aes';
import type { AuthRequestContext } from '@/iam/auth-request.context';
import type { AuthenticatedUser } from '@/iam/auth.types';
import { PrismaService } from '@/prisma/prisma.service';

import type { IntegrationEmployee, IntegrationEmployeeDetail, IntegrationRef } from '@packages/types';

import { employeeCodeKey, normalizeEmployeeCode } from '@/common/utils/employee-code';

import type { UpsertIntegrationDto } from './dto/integration.dto';
import { INTEGRATION_APIS } from './integration.catalog';
import { IntegrationClient } from './integration.client';
import { integrationTokens } from './integration.token';
import { IntegrationsQueryService } from './integrations.query.service';

@Injectable()
export class IntegrationsCommandService {
  private readonly logger = new Logger(IntegrationsCommandService.name);
  private readonly key: Buffer;

  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly queries: IntegrationsQueryService,
    private readonly audit: AuditCommandService,
  ) {
    const secret = config.get<string>('auth.jwtSecret');
    if (!secret) {
      throw new Error('JWT_SECRET is not set');
    }
    this.key = deriveEncryptionKey(secret);
  }

  async create(
    actor: AuthenticatedUser,
    input: UpsertIntegrationDto,
    context: AuthRequestContext,
  ) {
    if (!input.clientSecret) {
      throw new BadRequestAppException();
    }

    const restaurantId = await this.ensureRestaurantId();
    const id = await this.prisma.$transaction(async (tx) => {
      const row = await tx.integration.create({
        data: {
          restaurantId,
          name: input.name,
          baseUrl: trimBase(input.baseUrl),
          clientId: input.clientId,
          secretCipher: encryptSecret(input.clientSecret!, this.key),
          isEnabled: input.isEnabled ?? true,
          apis: { create: apiRows(input.scopes) },
        },
      });

      await this.audit.record(tx, {
        actor,
        context,
        action: AuditAction.CREATE,
        resourceType: 'integration',
        resourceId: row.id,
        after: { name: row.name, baseUrl: row.baseUrl, scopes: input.scopes },
      });

      return row.id;
    });

    return this.queries.getById(id);
  }

  async update(
    actor: AuthenticatedUser,
    id: string,
    input: UpsertIntegrationDto,
    context: AuthRequestContext,
  ) {
    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.integration.findFirst({ where: { id } });
      if (!existing || existing.deletedAt) {
        throw new NotFoundAppException();
      }

      await tx.integration.update({
        where: { id },
        data: {
          name: input.name,
          baseUrl: trimBase(input.baseUrl),
          clientId: input.clientId,
          ...(input.clientSecret
            ? { secretCipher: encryptSecret(input.clientSecret, this.key) }
            : {}),
          ...(input.isEnabled !== undefined ? { isEnabled: input.isEnabled } : {}),
          rowVersion: { increment: 1 },
        },
      });

      await tx.integrationApi.deleteMany({ where: { integrationId: id } });
      await tx.integrationApi.createMany({ data: apiRows(input.scopes).map((api) => ({ ...api, integrationId: id })) });

      await this.audit.record(tx, {
        actor,
        context,
        action: AuditAction.UPDATE,
        resourceType: 'integration',
        resourceId: id,
        after: { name: input.name, scopes: input.scopes },
      });
    });

    integrationTokens.invalidate(id);
    return this.queries.getById(id);
  }

  async remove(actor: AuthenticatedUser, id: string, context: AuthRequestContext) {
    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.integration.findFirst({ where: { id } });
      if (!existing || existing.deletedAt) {
        throw new NotFoundAppException();
      }

      await tx.integration.update({
        where: { id },
        data: { deletedAt: new Date(), isEnabled: false, rowVersion: { increment: 1 } },
      });

      await this.audit.record(tx, {
        actor,
        context,
        action: AuditAction.DELETE,
        resourceType: 'integration',
        resourceId: id,
        before: { name: existing.name, clientId: existing.clientId },
      });
    });

    integrationTokens.invalidate(id);
  }

  async syncEmployees(actor: AuthenticatedUser, id: string, context: AuthRequestContext) {
    return this.syncIntegration(id).then(async (result) => {
      await this.prisma.$transaction(async (tx) => {
        await this.audit.record(tx, {
          actor,
          context,
          action: AuditAction.UPDATE,
          resourceType: 'integration',
          resourceId: id,
          after: { syncedEmployees: result.saved },
        });
      });
      return result;
    });
  }

  private async syncIntegration(id: string) {
    const integration = await this.prisma.integration.findFirst({
      where: { id, deletedAt: null, isEnabled: true },
      include: { apis: true },
    });

    if (!integration) {
      throw new NotFoundAppException();
    }

    const scopes = new Set(integration.apis.filter((api) => api.isEnabled).map((api) => api.scope));
    if (!scopes.has('employees:read')) {
      throw new BadRequestAppException();
    }

    const client = new IntegrationClient({
      id: integration.id,
      baseUrl: integration.baseUrl,
      clientId: integration.clientId,
      clientSecret: decryptSecret(integration.secretCipher, this.key),
    });

    const listed = await client.listAll<IntegrationEmployee>('/integration/employees');

    let saved = 0;
    for (const summary of listed) {
      let detail: IntegrationEmployeeDetail = { ...summary, vehicle: null };
      try {
        detail = await client.getItem<IntegrationEmployeeDetail>(
          `/integration/employees/${summary.id}`,
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : 'detail fetch failed';
        this.logger.warn(`Employee ${summary.id} detail skipped: ${message}`);
      }
      try {
        const wrote = await this.upsertEmployee(integration.restaurantId, detail);
        if (wrote) {
          saved += 1;
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'upsert failed';
        this.logger.warn(`Employee ${summary.id} upsert skipped: ${message}`);
      }
    }

    await this.linkMealOrdersToEmployees(integration.restaurantId);

    await this.prisma.integration.update({
      where: { id },
      data: { lastSyncedAt: new Date() },
    });

    return { saved };
  }

  async syncAll() {
    const rows = await this.prisma.integration.findMany({
      where: {
        deletedAt: null,
        isEnabled: true,
        apis: { some: { scope: 'employees:read', isEnabled: true } },
      },
      select: { id: true },
    });

    let saved = 0;
    const failed: string[] = [];
    for (const row of rows) {
      try {
        const result = await this.syncIntegration(row.id);
        saved += result.saved;
      } catch (error) {
        failed.push(row.id);
        const message = error instanceof Error ? error.message : 'sync failed';
        this.logger.error(`Employee sync failed for ${row.id}: ${message}`);
      }
    }

    if (rows.length > 0 && failed.length === rows.length) {
      throw new BadGatewayAppException();
    }

    return { saved, integrations: rows.length - failed.length, failed: failed.length };
  }

  private async upsertEmployee(restaurantId: string, employee: IntegrationEmployeeDetail) {
    if (!employee.id) {
      this.logger.warn('Skip MLOS employee: missing id');
      return false;
    }

    const rawCode = employee.code?.trim() ?? '';
    const employeeCode = rawCode.length > 0 ? rawCode.slice(0, 32) : null;
    const data = {
      employeeCode,
      firstName: clip(employee.firstName, 100, '—'),
      lastName: clip(employee.lastName, 100, '—'),
      department: labelOf(employee.department),
      position: labelOf(employee.position),
      externalId: employee.id,
      vehicle: employee.vehicle ? (employee.vehicle as Prisma.InputJsonValue) : Prisma.DbNull,
    };

    const existing = await this.prisma.employee.findFirst({
      where: {
        restaurantId,
        deletedAt: null,
        OR: [
          { externalId: employee.id },
          ...(data.employeeCode
            ? [
                {
                  employeeCode: { equals: data.employeeCode, mode: 'insensitive' as const },
                  externalId: null,
                },
              ]
            : []),
        ],
      },
    });

    if (!existing) {
      await this.prisma.employee.create({
        data: { restaurantId, ...data, status: mapStatus(employee.status) },
      });
      return true;
    }

    // Keep rest_sk status. Sync must not reactivate locally inactive staff
    // just because they are still active in MLOS.
    await this.prisma.employee.update({
      where: { id: existing.id },
      data: { ...data, rowVersion: { increment: 1 } },
    });
    return true;
  }

  /** Attach `employeeId` on meal orders when staff exist locally (code match). */
  private async linkMealOrdersToEmployees(restaurantId: string) {
    const pending = await this.prisma.employeeMealOrder.findMany({
      where: {
        employeeId: null,
        employeeCode: { not: '' },
        mealDay: { restaurantId, deletedAt: null },
      },
      select: { id: true, employeeCode: true },
      take: 500,
    });
    if (!pending.length) {
      return;
    }

    const employees = await this.prisma.employee.findMany({
      where: { restaurantId, deletedAt: null, employeeCode: { not: null } },
      select: { id: true, employeeCode: true },
    });
    const byCode = new Map<string, string>();
    for (const row of employees) {
      const code = row.employeeCode?.trim();
      if (!code) continue;
      byCode.set(employeeCodeKey(code), row.id);
    }

    for (const order of pending) {
      const employeeId = byCode.get(employeeCodeKey(order.employeeCode));
      if (!employeeId) continue;
      await this.prisma.employeeMealOrder.update({
        where: { id: order.id },
        data: { employeeId },
      });
    }
  }

  private async ensureRestaurantId() {
    return this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('restaurant:singleton'))`;
      const existing = await tx.restaurant.findFirst({
        where: { deletedAt: null },
        orderBy: { createdAt: 'asc' },
        select: { id: true },
      });
      if (existing) {
        return existing.id;
      }

      const created = await tx.restaurant.create({
        data: {
          code: 'main',
          name: 'Restaurant',
          legalName: 'Restaurant',
          setting: { create: {} },
        },
        select: { id: true },
      });
      return created.id;
    });
  }
}

function apiRows(scopes: string[]) {
  const enabled = new Set(scopes);
  return INTEGRATION_APIS.map((api) => ({
    scope: api.scope,
    method: api.method,
    path: api.path,
    isEnabled: enabled.has(api.scope),
  }));
}

function trimBase(url: string) {
  return url.replace(/\/+$/, '');
}

function labelOf(ref: IntegrationRef | null | undefined) {
  const value = ref?.name?.trim() || ref?.code?.trim() || '—';
  return value.slice(0, 100);
}

function clip(value: string | null | undefined, max: number, fallback = '') {
  const trimmed = value?.trim() ?? '';
  return (trimmed.length > 0 ? trimmed : fallback).slice(0, max);
}

function mapStatus(status: IntegrationEmployeeDetail['status'] | null): EmployeeStatus {
  if (status === 'active') {
    return EmployeeStatus.ACTIVE;
  }
  if (status === 'terminated') {
    return EmployeeStatus.INACTIVE;
  }
  return EmployeeStatus.INACTIVE;
}
