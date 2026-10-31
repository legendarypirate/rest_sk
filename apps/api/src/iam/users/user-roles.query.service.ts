import { Injectable } from '@nestjs/common';
import type { UserRoleAssignment } from '@packages/types';

import { NotFoundAppException } from '@/common/exceptions';
import { PrismaService } from '@/prisma/prisma.service';
import { toUserRoleAssignment, type UserRoleRow } from './users.mapper';

const assignmentInclude = {
  role: { select: { id: true, slug: true, name: true, scope: true } },
} as const;

@Injectable()
export class UserRolesQueryService {
  constructor(private readonly prisma: PrismaService) {}

  async listByUserId(userId: string): Promise<UserRoleAssignment[]> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundAppException();
    }

    const rows = await this.prisma.userRole.findMany({
      where: { userId },
      include: assignmentInclude,
      orderBy: { grantedAt: 'desc' },
    });

    return rows.map((row) => toUserRoleAssignment(row as UserRoleRow));
  }

  async getByUserAndRole(
    userId: string,
    roleId: string,
  ): Promise<UserRoleAssignment> {
    const row = await this.prisma.userRole.findFirst({
      where: { userId, roleId },
      include: assignmentInclude,
    });

    if (!row) {
      throw new NotFoundAppException();
    }

    return toUserRoleAssignment(row as UserRoleRow);
  }
}
