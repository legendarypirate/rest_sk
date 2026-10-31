import { Injectable } from '@nestjs/common';
import { AuditAction, Prisma } from '@generated/prisma/client';

import { AuditCommandService } from '@/audit';
import { BadRequestAppException, ConflictAppException, NotFoundAppException } from '@/common/exceptions';
import type { AuthRequestContext } from '@/iam/auth-request.context';
import type { AuthenticatedUser } from '@/iam/auth.types';
import { PrismaService } from '@/prisma/prisma.service';

import type { UpsertKitchenDto, UpsertKitchenStationDto } from './dto/kitchen.dto';
import { KitchenQueryService } from '@/kitchens/kitchen.query.service';

@Injectable()
export class KitchenCommandService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queries: KitchenQueryService,
    private readonly audit: AuditCommandService,
  ) {}

  async createKitchen(actor: AuthenticatedUser, input: UpsertKitchenDto, context: AuthRequestContext) {
    const restaurantId = await this.ensureRestaurantId();
    const id = await this.prisma
      .$transaction(async (tx) => {
        const row = await tx.kitchen.create({
          data: {
            restaurantId,
            code: input.code,
            name: input.name,
            isActive: input.isActive ?? true,
          },
        });
        await this.audit.record(tx, {
          actor,
          context,
          action: AuditAction.CREATE,
          resourceType: 'kitchen',
          resourceId: row.id,
          after: { code: row.code, name: row.name },
        });
        return row.id;
      })
      .catch(rethrowConflict);
    return this.queries.getKitchen(id);
  }

  async updateKitchen(actor: AuthenticatedUser, id: string, input: UpsertKitchenDto, context: AuthRequestContext) {
    await this.prisma
      .$transaction(async (tx) => {
        const existing = await tx.kitchen.findFirst({ where: { id, deletedAt: null } });
        if (!existing) throw new NotFoundAppException();
        await tx.kitchen.update({
          where: { id },
          data: {
            code: input.code,
            name: input.name,
            isActive: input.isActive ?? existing.isActive,
            rowVersion: { increment: 1 },
          },
        });
        await this.audit.record(tx, {
          actor,
          context,
          action: AuditAction.UPDATE,
          resourceType: 'kitchen',
          resourceId: id,
          before: { code: existing.code, name: existing.name },
          after: { code: input.code, name: input.name },
        });
      })
      .catch(rethrowConflict);
    return this.queries.getKitchen(id);
  }

  async removeKitchen(actor: AuthenticatedUser, id: string, context: AuthRequestContext) {
    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.kitchen.findFirst({ where: { id, deletedAt: null } });
      if (!existing) throw new NotFoundAppException();
      const stations = await tx.kitchenStation.count({ where: { kitchenId: id, deletedAt: null } });
      const orders = await tx.kitchenOrder.count({ where: { kitchenId: id } });
      if (stations > 0 || orders > 0) throw new BadRequestAppException();
      await tx.kitchen.update({
        where: { id },
        data: { deletedAt: new Date(), rowVersion: { increment: 1 } },
      });
      await this.audit.record(tx, {
        actor,
        context,
        action: AuditAction.DELETE,
        resourceType: 'kitchen',
        resourceId: id,
        before: { code: existing.code, name: existing.name },
      });
    });
  }

  async createStation(actor: AuthenticatedUser, input: UpsertKitchenStationDto, context: AuthRequestContext) {
    const id = await this.prisma
      .$transaction(async (tx) => {
        await this.assertKitchen(tx, input.kitchenId);
        const row = await tx.kitchenStation.create({
          data: {
            kitchenId: input.kitchenId,
            code: input.code,
            name: input.name,
            stationType: input.stationType,
            sortOrder: input.sortOrder ?? 0,
            isActive: input.isActive ?? true,
          },
        });
        await this.audit.record(tx, {
          actor,
          context,
          action: AuditAction.CREATE,
          resourceType: 'kitchen_station',
          resourceId: row.id,
          after: { code: row.code, name: row.name, kitchenId: row.kitchenId },
        });
        return row.id;
      })
      .catch(rethrowConflict);
    return this.queries.getStation(id);
  }

  async updateStation(
    actor: AuthenticatedUser,
    id: string,
    input: UpsertKitchenStationDto,
    context: AuthRequestContext,
  ) {
    await this.prisma
      .$transaction(async (tx) => {
        const existing = await tx.kitchenStation.findFirst({ where: { id, deletedAt: null } });
        if (!existing) throw new NotFoundAppException();
        await this.assertKitchen(tx, input.kitchenId);
        await tx.kitchenStation.update({
          where: { id },
          data: {
            kitchenId: input.kitchenId,
            code: input.code,
            name: input.name,
            stationType: input.stationType,
            sortOrder: input.sortOrder ?? existing.sortOrder,
            isActive: input.isActive ?? existing.isActive,
          },
        });
        await this.audit.record(tx, {
          actor,
          context,
          action: AuditAction.UPDATE,
          resourceType: 'kitchen_station',
          resourceId: id,
          before: { code: existing.code, name: existing.name },
          after: { code: input.code, name: input.name },
        });
      })
      .catch(rethrowConflict);
    return this.queries.getStation(id);
  }

  async removeStation(actor: AuthenticatedUser, id: string, context: AuthRequestContext) {
    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.kitchenStation.findFirst({ where: { id, deletedAt: null } });
      if (!existing) throw new NotFoundAppException();
      const items = await tx.kitchenOrderItem.count({ where: { stationId: id } });
      const tickets = await tx.kitchenTicket.count({ where: { stationId: id } });
      if (items > 0 || tickets > 0) throw new BadRequestAppException();
      await tx.kitchenStation.update({ where: { id }, data: { deletedAt: new Date() } });
      await this.audit.record(tx, {
        actor,
        context,
        action: AuditAction.DELETE,
        resourceType: 'kitchen_station',
        resourceId: id,
        before: { code: existing.code, name: existing.name },
      });
    });
  }

  private async assertKitchen(tx: Prisma.TransactionClient, id: string) {
    const row = await tx.kitchen.findFirst({ where: { id, deletedAt: null }, select: { id: true } });
    if (!row) throw new NotFoundAppException();
  }

  private async ensureRestaurantId() {
    return this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext('restaurant:singleton'))`;
      const existing = await tx.restaurant.findFirst({
        where: { deletedAt: null },
        orderBy: { createdAt: 'asc' },
        select: { id: true },
      });
      if (existing) return existing.id;
      const restaurant = await tx.restaurant.create({
        data: {
          code: 'main',
          name: 'Restaurant',
          legalName: 'Restaurant',
          setting: { create: {} },
        },
        select: { id: true },
      });
      return restaurant.id;
    });
  }
}

function rethrowConflict(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    throw new ConflictAppException();
  }
  throw error;
}
