export const pageSize = 12;

export function oneParam(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return "";
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export function pageNumber(value: string | string[] | undefined): number | null {
  if (value === undefined) return 1;
  const raw = oneParam(value);
  if (!/^\d+$/.test(raw)) return null;
  const page = Number(raw);
  return page >= 1 ? page : null;
}

export function listingPath(base: string, page: number, category?: string): string {
  const root = category ? `${base}/category/${category}` : base;
  if (page <= 1) return root;
  return `${root}/page/${page}`;
}

export interface ListingCard {
  id: number;
  title: string;
  excerpt: string;
  date?: string;
  category?: string;
  image?: string;
  to?: string;
  external?: string;
  html?: string;
}

export function slicePage<T>(items: T[], page: number, size = pageSize) {
  const pages = Math.max(1, Math.ceil(items.length / size));
  const start = (page - 1) * size;
  return { items: items.slice(start, start + size), pages };
}
