export interface PageResult<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}

export function asPage<T>(body: unknown): PageResult<T> {
  if (Array.isArray(body)) {
    return {
      items: body as T[],
      total: body.length,
      page: 1,
      pages: body.length ? 1 : 0,
    };
  }
  if (!body || typeof body !== "object" || !("items" in body)) {
    return { items: [], total: 0, page: 1, pages: 0 };
  }
  const record = body as {
    items?: unknown;
    total?: number;
    page?: number;
    pages?: number;
  };
  const items = Array.isArray(record.items) ? (record.items as T[]) : [];
  const total = typeof record.total === "number" ? record.total : items.length;
  const pages = typeof record.pages === "number" ? record.pages : total > 0 ? 1 : 0;
  const page = typeof record.page === "number" ? record.page : 1;
  return { items, total, page, pages };
}
