import { Injectable } from '@nestjs/common';
import { AuditAction, Prisma, RecordStatus } from '@generated/prisma/client';

import { AuditCommandService } from '@/audit';
import { ConflictAppException, NotFoundAppException } from '@/common/exceptions';
import type { AuthRequestContext } from '@/iam/auth-request.context';
import type { AuthenticatedUser } from '@/iam/auth.types';
import { PrismaService } from '@/prisma/prisma.service';

import type { UpdateRestaurantSettingDto, UpsertRestaurantDto } from './dto/restaurant.dto';
import { RestaurantQueryService } from './restaurant.query.service';

@Injectable()
export class RestaurantCommandService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queries: RestaurantQueryService,
    private readonly audit: AuditCommandService,
  ) {}

  async create(actor: AuthenticatedUser, input: UpsertRestaurantDto, context: AuthRequestContext) {
    const id = await this.prisma
      .$transaction(async (tx) => {
        const existing = await tx.restaurant.findFirst({
          where: { deletedAt: null },
          select: { id: true },
        });
        if (existing) throw new ConflictAppException();
        const row = await tx.restaurant.create({
          data: {
            code: input.code,
            name: input.name,
            legalName: input.legalName,
            taxId: input.taxId,
            phone: input.phone,
            email: input.email,
            country: input.country ?? 'MN',
            city: input.city,
            addressLine: input.addressLine,
            timezone: input.timezone ?? 'Asia/Ulaanbaatar',
            locale: input.locale ?? 'mn',
            currency: input.currency ?? 'MNT',
            status: input.status ?? RecordStatus.ACTIVE,
            setting: {
              create: { currency: input.currency ?? 'MNT' },
            },
          },
        });
        await this.audit.record(tx, {
          actor,
          context,
          action: AuditAction.CREATE,
          resourceType: 'restaurant',
          resourceId: row.id,
          after: { code: row.code, name: row.name },
        });
        return row.id;
      })
      .catch((error: unknown) => {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
          throw new ConflictAppException();
        }
        throw error;
      });
    return this.queries.getById(id);
  }

  async update(
    actor: AuthenticatedUser,
    id: string,
    input: UpsertRestaurantDto,
    context: AuthRequestContext,
  ) {
    await this.prisma
      .$transaction(async (tx) => {
        const existing = await tx.restaurant.findFirst({ where: { id, deletedAt: null } });
        if (!existing) throw new NotFoundAppException();
        await tx.restaurant.update({
          where: { id },
          data: {
            code: input.code,
            name: input.name,
            legalName: input.legalName,
            taxId: input.taxId ?? null,
            phone: input.phone ?? null,
            email: input.email ?? null,
            country: input.country ?? existing.country,
            city: input.city ?? null,
            addressLine: input.addressLine ?? null,
            timezone: input.timezone ?? existing.timezone,
            locale: input.locale ?? existing.locale,
            currency: input.currency ?? existing.currency,
            status: input.status ?? existing.status,
            rowVersion: { increment: 1 },
          },
        });
        await this.audit.record(tx, {
          actor,
          context,
          action: AuditAction.UPDATE,
          resourceType: 'restaurant',
          resourceId: id,
          before: { code: existing.code, name: existing.name },
          after: { code: input.code, name: input.name },
        });
      })
      .catch((error: unknown) => {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
          throw new ConflictAppException();
        }
        throw error;
      });
    return this.queries.getById(id);
  }

  async updateSetting(
    actor: AuthenticatedUser,
    id: string,
    input: UpdateRestaurantSettingDto,
    context: AuthRequestContext,
  ) {
    await this.prisma.$transaction(async (tx) => {
      const restaurant = await tx.restaurant.findFirst({ where: { id, deletedAt: null } });
      if (!restaurant) throw new NotFoundAppException();
      const setting = await tx.restaurantSetting.upsert({
        where: { restaurantId: id },
        create: {
          restaurantId: id,
          ...input,
          currency: input.currency ?? restaurant.currency,
        },
        update: {
          ...input,
          rowVersion: { increment: 1 },
        },
      });
      await this.audit.record(tx, {
        actor,
        context,
        action: AuditAction.UPDATE,
        resourceType: 'restaurant_setting',
        resourceId: setting.id,
        after: {
          kioskEnabled: setting.kioskEnabled,
          kitchenEnabled: setting.kitchenEnabled,
          employeeMealsEnabled: setting.employeeMealsEnabled,
          currency: setting.currency,
        },
      });
    });
    return this.queries.getById(id);
  }

  async remove(actor: AuthenticatedUser, id: string, context: AuthRequestContext) {
    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.restaurant.findFirst({ where: { id, deletedAt: null } });
      if (!existing) throw new NotFoundAppException();
      await tx.restaurant.update({
        where: { id },
        data: { deletedAt: new Date(), rowVersion: { increment: 1 } },
      });
      await this.audit.record(tx, {
        actor,
        context,
        action: AuditAction.DELETE,
        resourceType: 'restaurant',
        resourceId: id,
        before: { code: existing.code, name: existing.name },
      });
    });
  }
}
