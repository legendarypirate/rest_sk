import { Injectable } from '@nestjs/common';
import { Prisma } from '@generated/prisma/client';
import type { Paginated, UserDetail, UserListItem } from '@packages/types';

import { NotFoundAppException } from '@/common/exceptions';
import {
  paginated,
  resolvePagination,
  resolveSort,
} from '@/common/utils/pagination';
import { PrismaService } from '@/prisma/prisma.service';
import type { ListUsersQueryDto } from './dto/users.dto';
import {
  toUserDetail,
  toUserListItem,
  userListInclude,
  type UserListRow,
} from './users.mapper';

const USER_SORT = {
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  lastLoginAt: 'lastLoginAt',
  email: 'emailNormalized',
  displayName: 'displayName',
} as const;

@Injectable()
export class UsersQueryService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListUsersQueryDto): Promise<Paginated<UserListItem>> {
    const { page, limit, skip, take } = resolvePagination(query.page, query.limit);
    const { sortBy, sortDirection } = resolveSort(
      query.sortBy,
      ['createdAt', 'updatedAt', 'lastLoginAt', 'email', 'displayName'] as const,
      'createdAt',
      query.sortDirection,
    );
    const search = query.search?.trim();
    const where: Prisma.UserWhereInput = {
      ...(query.includeDeleted ? {} : { deletedAt: null }),
      ...(query.status ? { status: query.status } : {}),
      ...(query.roleId ? { userRoles: { some: { roleId: query.roleId } } } : {}),
      ...(search
        ? {
            OR: [
              { email: { contains: search, mode: 'insensitive' } },
              { emailNormalized: { contains: search.toLowerCase() } },
              { username: { contains: search, mode: 'insensitive' } },
              { displayName: { contains: search, mode: 'insensitive' } },
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const orderBy: Prisma.UserOrderByWithRelationInput =
      sortBy === 'lastLoginAt'
        ? { lastLoginAt: { sort: sortDirection, nulls: 'last' } }
        : { [USER_SORT[sortBy]]: sortDirection };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        include: userListInclude,
        orderBy,
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

  async getById(id: string): Promise<UserDetail> {
    const user = await this.prisma.user.findFirst({
      where: { id },
      include: userListInclude,
    });

    if (!user) {
      throw new NotFoundAppException();
    }

    return toUserDetail(user as UserListRow);
  }

  async getByPublicId(publicId: string): Promise<UserDetail> {
    const user = await this.prisma.user.findFirst({
      where: { publicId },
      include: userListInclude,
    });

    if (!user) {
      throw new NotFoundAppException();
    }

    return toUserDetail(user as UserListRow);
  }
}
