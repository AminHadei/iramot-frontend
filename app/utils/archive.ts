import type { ArchiveFile, ArchiveItem, CategorySet } from "~/types/content";
import { plainText } from "~/utils/plainText";

export const pageSize = 12;

export function archiveItems(file: unknown): ArchiveItem[] {
  if (!file || typeof file !== "object" || !("body" in file)) return [];
  const body = (file as ArchiveFile).body;
  return Array.isArray(body) ? body : [];
}

export function categoryInSet(slug: string, set: CategorySet): boolean {
  if (set.slugs.includes(slug)) return true;
  return (set.prefixes ?? []).some((prefix) => slug.startsWith(prefix));
}

export function itemInSet(item: ArchiveItem, set: CategorySet): boolean {
  return (item.categories ?? []).some((category) => categoryInSet(category.slug, set));
}

export function byDateDesc(items: ArchiveItem[]): ArchiveItem[] {
  return [...items].sort((left, right) => right.date.localeCompare(left.date));
}

export function nextOrLatest(
  items: ArchiveItem[],
  today = new Date(),
): ArchiveItem | undefined {
  const todayKey = today.toISOString().slice(0, 10);
  const upcoming = items
    .filter((item) => item.date.slice(0, 10) >= todayKey)
    .sort((left, right) => left.date.localeCompare(right.date));
  return upcoming[0] ?? byDateDesc(items)[0];
}

export function categoryName(
  item: ArchiveItem,
  preferred?: CategorySet,
): string | undefined {
  const categories = item.categories ?? [];
  if (preferred) {
    const match = categories.find((category) =>
      categoryInSet(category.slug, preferred),
    );
    if (match) return match.name;
  }
  return categories[0]?.name;
}

export function externalHref(html: string): string | undefined {
  for (const match of html.matchAll(/href="(https?:\/\/[^"]+)"/gi)) {
    const url = match[1];
    if (!url) continue;
    if (url.includes("iramot.ir")) continue;
    return url;
  }
  return undefined;
}

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

export function researchPath(slug: string): string {
  return `/research/${slug}`;
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

export function toCard(
  item: ArchiveItem,
  options: { to?: string; external?: string; category?: string; html?: string } = {},
): ListingCard {
  return {
    id: item.id,
    title: item.title,
    excerpt: plainText(item.excerpt || ""),
    date: item.date,
    category: options.category ?? item.categories?.[0]?.name,
    image: item.featuredImage?.localPath || undefined,
    to: options.to,
    external: options.external,
    html: options.html,
  };
}

export function listFilters(
  items: ArchiveItem[],
  set: CategorySet,
): Array<{ slug: string; name: string }> {
  const found = new Map<string, string>();
  for (const item of items) {
    for (const category of item.categories ?? []) {
      if (categoryInSet(category.slug, set)) found.set(category.slug, category.name);
    }
  }
  const rank = new Map(set.slugs.map((slug, index) => [slug, index]));
  return [...found.entries()]
    .map(([slug, name]) => ({ slug, name }))
    .sort((left, right) => {
      const leftRank = rank.get(left.slug);
      const rightRank = rank.get(right.slug);
      if (leftRank !== undefined && rightRank !== undefined)
        return leftRank - rightRank;
      if (leftRank !== undefined) return -1;
      if (rightRank !== undefined) return 1;
      return left.name.localeCompare(right.name, "fa");
    });
}

export function slicePage<T>(items: T[], page: number, size = pageSize) {
  const pages = Math.max(1, Math.ceil(items.length / size));
  const start = (page - 1) * size;
  return { items: items.slice(start, start + size), pages };
}
