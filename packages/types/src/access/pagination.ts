export type SortDirection = 'asc' | 'desc';
export type PageLimit = number | '*';

export type PaginationQuery = {
  page?: number;
  limit?: PageLimit;
  sortBy?: string;
  sortDirection?: SortDirection;
};

export type PaginationMeta = {
  total: number;
  page: number;
  limit: PageLimit;
  totalPages: number;
};

export type Paginated<T> = {
  items: T[];
  meta: PaginationMeta;
};
