import { Injectable } from '@nestjs/common';
import { AuditAction } from '@generated/prisma/client';

import { AuditCommandService } from '@/audit';
import {
  BadRequestAppException,
  ConflictAppException,
  NotFoundAppException,
} from '@/common/exceptions';
import { PrismaService } from '@/prisma/prisma.service';
import type { AuthRequestContext } from '../auth-request.context';
import type { AuthenticatedUser } from '../auth.types';
import type { AssignUserRoleDto, ReplaceUserRolesDto } from './dto/user-roles.dto';
import {
  assertNotLastSystemAdmin,
  loadAssignableRoles,
  userHoldsSystemRole,
} from './users.policy';
import { UserRolesQueryService } from './user-roles.query.service';

@Injectable()
export class UserRolesCommandService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queries: UserRolesQueryService,
    private readonly audit: AuditCommandService,
  ) {}

  async assign(
    actor: AuthenticatedUser,
    userId: string,
    input: AssignUserRoleDto,
    context: AuthRequestContext,
  ) {
    const expiresAt = this.parseExpiry(input.expiresAt);

    await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findFirst({
        where: { id: userId, deletedAt: null },
        select: { id: true },
      });

      if (!user) {
        throw new NotFoundAppException();
      }

      const [role] = await loadAssignableRoles(tx, [input.roleId]);
      const existing = await tx.userRole.findFirst({
        where: { userId, roleId: role.id },
      });

      if (existing) {
        throw new ConflictAppException();
      }

      await tx.userRole.create({
        data: {
          userId,
          roleId: role.id,
          grantedById: actor.id,
          expiresAt,
        },
      });

      await this.audit.record(tx, {
        actor,
        context,
        action: AuditAction.PERMISSION_GRANT,
        resourceType: 'user_role',
        resourceId: role.id,
        targetUserId: userId,
        after: { roleId: role.id, slug: role.slug, expiresAt: expiresAt?.toISOString() ?? null },
      });
    });

    return this.queries.getByUserAndRole(userId, input.roleId);
  }

  async replace(
    actor: AuthenticatedUser,
    userId: string,
    input: ReplaceUserRolesDto,
    context: AuthRequestContext,
  ) {
    const now = new Date();
    const roleIds = input.assignments.map((item) => item.roleId);

    await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findFirst({
        where: { id: userId, deletedAt: null },
        select: { id: true },
      });

      if (!user) {
        throw new NotFoundAppException();
      }

      const roles = await loadAssignableRoles(tx, roleIds);
      const nextIds = new Set(roles.map((role) => role.id));
      const current = await tx.userRole.findMany({
        where: { userId },
        include: { role: { select: { isSystem: true } } },
      });

      const nextHasSystem = roles.some((role) => role.isSystem);
      const currentlySystem = await userHoldsSystemRole(tx, userId, now);

      if (currentlySystem && !nextHasSystem) {
        await assertNotLastSystemAdmin(tx, userId, now);
      }

      const expiryByRoleId = new Map(
        input.assignments.map((item) => [
          item.roleId,
          this.parseExpiry(item.expiresAt),
        ]),
      );

      await tx.userRole.deleteMany({
        where: { userId, roleId: { notIn: [...nextIds] } },
      });

      for (const role of roles) {
        const expiresAt = expiryByRoleId.get(role.id) ?? null;
        await tx.userRole.upsert({
          where: {
            userId_roleId: { userId, roleId: role.id },
          },
          create: {
            userId,
            roleId: role.id,
            grantedById: actor.id,
            expiresAt,
          },
          update: {
            expiresAt,
            grantedById: actor.id,
            grantedAt: now,
          },
        });
      }

      await this.audit.record(tx, {
        actor,
        context,
        action: AuditAction.UPDATE,
        resourceType: 'user_role',
        resourceId: userId,
        targetUserId: userId,
        before: { roleIds: current.map((row) => row.roleId) },
        after: { roleIds: [...nextIds] },
      });
    });

    return this.queries.listByUserId(userId);
  }

  async revoke(
    actor: AuthenticatedUser,
    userId: string,
    roleId: string,
    context: AuthRequestContext,
  ): Promise<void> {
    const now = new Date();

    await this.prisma.$transaction(async (tx) => {
      const assignment = await tx.userRole.findFirst({
        where: { userId, roleId },
        include: { role: true },
      });

      if (!assignment) {
        throw new NotFoundAppException();
      }

      if (assignment.role.isSystem) {
        await assertNotLastSystemAdmin(tx, userId, now);
      }

      await tx.userRole.delete({ where: { id: assignment.id } });

      await this.audit.record(tx, {
        actor,
        context,
        action: AuditAction.PERMISSION_REVOKE,
        resourceType: 'user_role',
        resourceId: roleId,
        targetUserId: userId,
        before: { roleId, slug: assignment.role.slug },
      });
    });
  }

  private parseExpiry(value?: string): Date | null {
    if (!value) {
      return null;
    }

    const expiresAt = new Date(value);

    if (Number.isNaN(expiresAt.getTime()) || expiresAt <= new Date()) {
      throw new BadRequestAppException();
    }

    return expiresAt;
  }
}
