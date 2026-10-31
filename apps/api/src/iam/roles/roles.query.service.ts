import { Injectable } from '@nestjs/common';
import { Prisma } from '@generated/prisma/client';
import type {
  Paginated,
  Permission,
  RoleDetail,
  RoleListItem,
  UserListItem,
} from '@packages/types';

import { NotFoundAppException } from '@/common/exceptions';
import {
  paginated,
  resolvePagination,
  resolveSort,
} from '@/common/utils/pagination';
import { PrismaService } from '@/prisma/prisma.service';
import {
  toUserListItem,
  userListInclude,
  type UserListRow,
} from '../users/users.mapper';
import type {
  ListPermissionsQueryDto,
  ListRoleUsersQueryDto,
  ListRolesQueryDto,
} from './dto/roles.dto';
import {
  roleDetailInclude,
  roleListInclude,
  toPermission,
  toRoleDetail,
  toRoleListItem,
  type RoleDetailRow,
  type RoleListRow,
} from './roles.mapper';

const ROLE_SORT = {
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  name: 'name',
  slug: 'slug',
  priority: 'priority',
} as const;

const ROLE_USER_SORT = {
  createdAt: 'createdAt',
  email: 'emailNormalized',
  displayName: 'displayName',
} as const;

@Injectable()
export class RolesQueryService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListRolesQueryDto): Promise<Paginated<RoleListItem>> {
    const { page, limit, skip, take } = resolvePagination(query.page, query.limit);
    const { sortBy, sortDirection } = resolveSort(
      query.sortBy,
      ['createdAt', 'updatedAt', 'name', 'slug', 'priority'] as const,
      'priority',
      query.sortDirection,
    );
    const search = query.search?.trim();
    const where: Prisma.RoleWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.scope ? { scope: query.scope } : {}),
      ...(query.isSystem === undefined ? {} : { isSystem: query.isSystem }),
      ...(search
        ? {
            OR: [
              { slug: { contains: search, mode: 'insensitive' } },
              { name: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.role.findMany({
        where,
        include: roleListInclude,
        orderBy: { [ROLE_SORT[sortBy]]: sortDirection },
        skip,
        take,
      }),
      this.prisma.role.count({ where }),
    ]);

    return paginated(
      (rows as RoleListRow[]).map((row) => toRoleListItem(row)),
      total,
      page,
      limit,
    );
  }

  async getById(id: string): Promise<RoleDetail> {
    const role = await this.prisma.role.findFirst({
      where: { id },
      include: roleDetailInclude,
    });

    if (!role) {
      throw new NotFoundAppException();
    }

    return toRoleDetail(role as RoleDetailRow);
  }

  async getBySlug(slug: string): Promise<RoleDetail> {
    const role = await this.prisma.role.findFirst({
      where: { slug, deletedAt: null },
      include: roleDetailInclude,
    });

    if (!role) {
      throw new NotFoundAppException();
    }

    return toRoleDetail(role as RoleDetailRow);
  }

  async listUsers(
    roleId: string,
    query: ListRoleUsersQueryDto,
  ): Promise<Paginated<UserListItem>> {
    await this.assertRoleExists(roleId);

    const { page, limit, skip, take } = resolvePagination(query.page, query.limit);
    const { sortBy, sortDirection } = resolveSort(
      query.sortBy,
      ['createdAt', 'email', 'displayName'] as const,
      'createdAt',
      query.sortDirection,
    );

    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      userRoles: { some: { roleId } },
    };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        include: userListInclude,
        orderBy: { [ROLE_USER_SORT[sortBy]]: sortDirection },
        skip,
        take,
      }),
      this.prisma.user.count({ where }),
    ]);

    return paginated(
      (rows as UserListRow[]).map((row) => toUserListItem(row)),
      total,
      page,
      limit,
    );
  }

  async listPermissions(
    query: ListPermissionsQueryDto,
  ): Promise<Paginated<Permission>> {
    const { page, limit, skip, take } = resolvePagination(query.page, query.limit);
    const search = query.search?.trim();
    const where: Prisma.PermissionWhereInput = {
      ...(query.scope ? { scope: query.scope } : {}),
      ...(query.resource ? { resource: query.resource } : {}),
      ...(search
        ? {
            OR: [
              { key: { contains: search, mode: 'insensitive' } },
              { name: { contains: search, mode: 'insensitive' } },
              { resource: { contains: search, mode: 'insensitive' } },
              { action: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.permission.findMany({
        where,
        orderBy: [{ resource: 'asc' }, { action: 'asc' }],
        skip,
        take,
      }),
      this.prisma.permission.count({ where }),
    ]);

    return paginated(rows.map(toPermission), total, page, limit);
  }

  private async assertRoleExists(id: string): Promise<void> {
    const role = await this.prisma.role.findFirst({
      where: { id },
      select: { id: true },
    });

    if (!role) {
      throw new NotFoundAppException();
    }
  }
}
