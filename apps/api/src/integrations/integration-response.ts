type ListMeta = {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
};

type ListBody<T> = {
  success?: boolean;
  data?: T[] | ({ items?: T[]; data?: T[] } & ListMeta);
} & ListMeta;

type ItemBody<T> = {
  success?: boolean;
  data?: T;
};

/** Extract paginated rows from MLOS `{ success, data: T[] }` or nested shapes. */
export function integrationListItems<T>(payload: ListBody<T>): T[] {
  const root = payload.data;
  if (Array.isArray(root)) {
    return root;
  }
  if (root && typeof root === 'object') {
    if (Array.isArray(root.items)) {
      return root.items;
    }
    if (Array.isArray(root.data)) {
      return root.data;
    }
  }
  return [];
}

export function integrationListTotalPages(payload: ListBody<unknown>, page: number) {
  if (typeof payload.totalPages === 'number' && payload.totalPages > 0) {
    return payload.totalPages;
  }
  const root = payload.data;
  if (root && typeof root === 'object' && !Array.isArray(root)) {
    const nested = root.totalPages;
    if (typeof nested === 'number' && nested > 0) {
      return nested;
    }
  }
  return page;
}

export function integrationItemData<T>(payload: ItemBody<T> | T): T | null {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    const data = (payload as ItemBody<T>).data;
    return data ?? null;
  }
  return (payload as T) ?? null;
}
