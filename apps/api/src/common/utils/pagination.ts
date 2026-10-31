import {
  ALL_DATA,
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  DEFAULT_SORT_DIRECTION,
  MAX_LIMIT,
  type PageLimit,
  type SortDirection,
} from '@packages/constants';
import type { Paginated } from '@packages/types';

export function resolvePagination(page?: number, limit?: PageLimit) {
  if (limit === ALL_DATA) {
    return {
      page: DEFAULT_PAGE,
      limit: ALL_DATA,
      skip: 0,
      take: undefined,
    };
  }

  const resolvedPage = page && page > 0 ? page : DEFAULT_PAGE;
  const resolvedLimit = Math.min(
    limit && limit > 0 ? limit : DEFAULT_LIMIT,
    MAX_LIMIT,
  );

  return {
    page: resolvedPage,
    limit: resolvedLimit,
    skip: (resolvedPage - 1) * resolvedLimit,
    take: resolvedLimit,
  };
}

export function resolveSort<T extends string>(
  sortBy: T | undefined,
  allowed: readonly T[],
  fallback: T,
  sortDirection?: SortDirection,
) {
  return {
    sortBy: sortBy && allowed.includes(sortBy) ? sortBy : fallback,
    sortDirection: sortDirection ?? DEFAULT_SORT_DIRECTION,
  };
}

export function paginated<T>(
  items: T[],
  total: number,
  page: number,
  limit: PageLimit,
): Paginated<T> {
  const isAll = limit === ALL_DATA;

  return {
    items,
    meta: {
      total,
      page: isAll ? DEFAULT_PAGE : page,
      limit: isAll ? ALL_DATA : limit,
      totalPages: isAll ? 1 : limit > 0 ? Math.ceil(total / limit) : 0,
    },
  };
}
