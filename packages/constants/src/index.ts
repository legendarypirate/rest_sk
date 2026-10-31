export type SortDirection = 'asc' | 'desc';

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 30;
export const MAX_LIMIT = 100;
export const ALL_DATA = '*' as const;
export const DEFAULT_SORT_DIRECTION: SortDirection = 'desc';

export type PageLimit = number | typeof ALL_DATA;

