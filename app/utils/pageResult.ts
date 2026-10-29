export interface PageResult<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}

const listKeys = [
  "items",
  "plans",
  "users",
  "applications",
  "codes",
  "payments",
] as const;

function listOf(record: Record<string, unknown>): unknown[] | null {
  for (const key of listKeys) {
    if (Array.isArray(record[key])) return record[key];
  }
  return null;
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
  if (!body || typeof body !== "object") {
    return { items: [], total: 0, page: 1, pages: 0 };
  }
  const record = body as Record<string, unknown>;
  const list = listOf(record);
  if (!list) return { items: [], total: 0, page: 1, pages: 0 };
  const items = list as T[];
  const total = typeof record.total === "number" ? record.total : items.length;
  const pages =
    typeof record.pages === "number"
      ? record.pages
      : typeof record.totalPages === "number"
        ? record.totalPages
        : total > 0
          ? 1
          : 0;
  const page = typeof record.page === "number" ? record.page : 1;
  return { items, total, page, pages };
}
