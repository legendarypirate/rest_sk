import { Injectable } from '@nestjs/common';
import { AuditAction, KioskDeviceStatus, KioskSessionStatus, Prisma } from '@generated/prisma/client';

import { AuditCommandService } from '@/audit';
import { BadRequestAppException, ConflictAppException, NotFoundAppException } from '@/common/exceptions';
import type { AuthRequestContext } from '@/iam/auth-request.context';
import type { AuthenticatedUser } from '@/iam/auth.types';
import { PrismaService } from '@/prisma/prisma.service';

import type { UpsertDeviceEventDto, UpsertKioskDeviceDto, UpsertKioskSessionDto } from './dto/kiosk.dto';
import { KioskQueryService } from '@/kiosks/kiosk.query.service';

@Injectable()
export class KioskCommandService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queries: KioskQueryService,
    private readonly audit: AuditCommandService,
  ) {}

  async createDevice(actor: AuthenticatedUser, input: UpsertKioskDeviceDto, context: AuthRequestContext) {
    const restaurantId = await this.ensureRestaurantId();
    const id = await this.prisma
      .$transaction(async (tx) => {
        const row = await tx.kioskDevice.create({
          data: {
            restaurantId,
            code: input.code,
            name: input.name,
            status: input.status ?? KioskDeviceStatus.OFFLINE,
            appVersion: input.appVersion,
            ipAddress: input.ipAddress,
          },
        });
        await this.audit.record(tx, {
          actor,
          context,
          action: AuditAction.CREATE,
          resourceType: 'kiosk_device',
          resourceId: row.id,
          after: { code: row.code, name: row.name },
        });
        return row.id;
      })
      .catch(rethrowConflict);
    return this.queries.getDevice(id);
  }

  async updateDevice(actor: AuthenticatedUser, id: string, input: UpsertKioskDeviceDto, context: AuthRequestContext) {
    await this.prisma
      .$transaction(async (tx) => {
        const existing = await tx.kioskDevice.findFirst({ where: { id, deletedAt: null } });
        if (!existing) throw new NotFoundAppException();
        await tx.kioskDevice.update({
          where: { id },
          data: {
            code: input.code,
            name: input.name,
            status: input.status ?? existing.status,
            appVersion: input.appVersion,
            ipAddress: input.ipAddress,
            rowVersion: { increment: 1 },
          },
        });
        await this.audit.record(tx, {
          actor,
          context,
          action: AuditAction.UPDATE,
          resourceType: 'kiosk_device',
          resourceId: id,
          before: { code: existing.code, name: existing.name },
          after: { code: input.code, name: input.name },
        });
      })
      .catch(rethrowConflict);
    return this.queries.getDevice(id);
  }

  async removeDevice(actor: AuthenticatedUser, id: string, context: AuthRequestContext) {
    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.kioskDevice.findFirst({ where: { id, deletedAt: null } });
      if (!existing) throw new NotFoundAppException();
      const sessions = await tx.kioskSession.count({ where: { deviceId: id } });
      const events = await tx.deviceEvent.count({ where: { deviceId: id } });
      const orders = await tx.order.count({ where: { kioskDeviceId: id } });
      if (sessions > 0 || events > 0 || orders > 0) throw new BadRequestAppException();
      await tx.kioskDevice.update({
        where: { id },
        data: { deletedAt: new Date(), rowVersion: { increment: 1 } },
      });
      await this.audit.record(tx, {
        actor,
        context,
        action: AuditAction.DELETE,
        resourceType: 'kiosk_device',
        resourceId: id,
        before: { code: existing.code, name: existing.name },
      });
    });
  }

  async createSession(actor: AuthenticatedUser, input: UpsertKioskSessionDto, context: AuthRequestContext) {
    const status = input.status ?? KioskSessionStatus.OPEN;
    const endedAt = this.endedAt(status, input.endedAt);
    const id = await this.prisma.$transaction(async (tx) => {
      await this.assertDevice(tx, input.deviceId);
      await this.assertEmployee(tx, input.employeeId);
      const row = await tx.kioskSession.create({
        data: { deviceId: input.deviceId, employeeId: input.employeeId, status, endedAt },
      });
      await this.audit.record(tx, {
        actor,
        context,
        action: AuditAction.CREATE,
        resourceType: 'kiosk_session',
        resourceId: row.id,
        after: { deviceId: row.deviceId, status: row.status },
      });
      return row.id;
    });
    return this.queries.getSession(id);
  }

  async updateSession(actor: AuthenticatedUser, id: string, input: UpsertKioskSessionDto, context: AuthRequestContext) {
    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.kioskSession.findFirst({ where: { id } });
      if (!existing) throw new NotFoundAppException();
      await this.assertDevice(tx, input.deviceId);
      await this.assertEmployee(tx, input.employeeId);
      const status = input.status ?? existing.status;
      await tx.kioskSession.update({
        where: { id },
        data: {
          deviceId: input.deviceId,
          employeeId: input.employeeId,
          status,
          endedAt: this.endedAt(status, input.endedAt, existing.endedAt),
        },
      });
      await this.audit.record(tx, {
        actor,
        context,
        action: AuditAction.UPDATE,
        resourceType: 'kiosk_session',
        resourceId: id,
        after: { deviceId: input.deviceId, status },
      });
    });
    return this.queries.getSession(id);
  }

  async removeSession(actor: AuthenticatedUser, id: string, context: AuthRequestContext) {
    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.kioskSession.findFirst({ where: { id } });
      if (!existing) throw new NotFoundAppException();
      const events = await tx.deviceEvent.count({ where: { sessionId: id } });
      const orders = await tx.order.count({ where: { kioskSessionId: id } });
      if (events > 0 || orders > 0) throw new BadRequestAppException();
      await tx.kioskSession.delete({ where: { id } });
      await this.audit.record(tx, {
        actor,
        context,
        action: AuditAction.DELETE,
        resourceType: 'kiosk_session',
        resourceId: id,
        before: { deviceId: existing.deviceId, status: existing.status },
      });
    });
  }

  async createEvent(actor: AuthenticatedUser, input: UpsertDeviceEventDto, context: AuthRequestContext) {
    const id = await this.prisma.$transaction(async (tx) => {
      await this.assertDevice(tx, input.deviceId);
      await this.assertSession(tx, input.deviceId, input.sessionId);
      const row = await tx.deviceEvent.create({
        data: {
          deviceId: input.deviceId,
          sessionId: input.sessionId,
          type: input.type,
          message: input.message,
          occurredAt: new Date(input.occurredAt),
        },
      });
      await this.audit.record(tx, {
        actor,
        context,
        action: AuditAction.CREATE,
        resourceType: 'device_event',
        resourceId: row.id,
        after: { deviceId: row.deviceId, type: row.type },
      });
      return row.id;
    });
    return this.queries.getEvent(id);
  }

  async updateEvent(actor: AuthenticatedUser, id: string, input: UpsertDeviceEventDto, context: AuthRequestContext) {
    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.deviceEvent.findFirst({ where: { id } });
      if (!existing) throw new NotFoundAppException();
      await this.assertDevice(tx, input.deviceId);
      await this.assertSession(tx, input.deviceId, input.sessionId);
      await tx.deviceEvent.update({
        where: { id },
        data: {
          deviceId: input.deviceId,
          sessionId: input.sessionId,
          type: input.type,
          message: input.message,
          occurredAt: new Date(input.occurredAt),
        },
      });
      await this.audit.record(tx, {
        actor,
        context,
        action: AuditAction.UPDATE,
        resourceType: 'device_event',
        resourceId: id,
        after: { deviceId: input.deviceId, type: input.type },
      });
    });
    return this.queries.getEvent(id);
  }

  async removeEvent(actor: AuthenticatedUser, id: string, context: AuthRequestContext) {
    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.deviceEvent.findFirst({ where: { id } });
      if (!existing) throw new NotFoundAppException();
      await tx.deviceEvent.delete({ where: { id } });
      await this.audit.record(tx, {
        actor,
        context,
        action: AuditAction.DELETE,
        resourceType: 'device_event',
        resourceId: id,
        before: { deviceId: existing.deviceId, type: existing.type },
      });
    });
  }

  private endedAt(status: KioskSessionStatus, input: string | null, existing?: Date | null) {
    if (status === KioskSessionStatus.OPEN) return null;
    if (input) return new Date(input);
    return existing ?? new Date();
  }

  private async assertDevice(tx: Prisma.TransactionClient, id: string) {
    const row = await tx.kioskDevice.findFirst({ where: { id, deletedAt: null }, select: { id: true } });
    if (!row) throw new NotFoundAppException();
  }

  private async assertEmployee(tx: Prisma.TransactionClient, id: string | null) {
    if (!id) return;
    const row = await tx.employee.findFirst({ where: { id, deletedAt: null }, select: { id: true } });
    if (!row) throw new NotFoundAppException();
  }

  private async assertSession(tx: Prisma.TransactionClient, deviceId: string, sessionId: string | null) {
    if (!sessionId) return;
    const row = await tx.kioskSession.findFirst({
      where: { id: sessionId, deviceId },
      select: { id: true },
    });
    if (!row) throw new BadRequestAppException();
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
