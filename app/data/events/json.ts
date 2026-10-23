import type { EventProgram } from "~/data/events/programs";
import { reservedEventSlugs, tehranToday } from "~/data/events/programs";
import type {
  EventArticle,
  EventIndexFile,
  EventList,
  EventListQuery,
  EventRecord,
  EventRepository,
  EventSummary,
} from "~/data/events/types";
import { articleHtml } from "~/utils/articleHtml";
import { withBase } from "~/utils/withBase";

let indexPromise: Promise<EventIndexFile> | null = null;
let indexBase = "";

function projectFile(path: string): string {
  const cwd =
    (globalThis as { process?: { cwd?: () => string } }).process?.cwd?.() ?? ".";
  return `${cwd}/public${path.startsWith("/") ? path : `/${path}`}`;
}

async function readPublic<T>(path: string): Promise<T> {
  const { readFile } = await import("node:fs/promises");
  return JSON.parse(await readFile(projectFile(path), "utf8")) as T;
}

function loadIndex(path: string, href: string): Promise<EventIndexFile> {
  const key = import.meta.server ? path : href;
  if (!indexPromise || indexBase !== key) {
    indexBase = key;
    const request = import.meta.server
      ? readPublic<EventIndexFile>(path)
      : $fetch<EventIndexFile>(href);
    indexPromise = request.catch((error: unknown) => {
      indexPromise = null;
      throw error;
    });
  }
  return indexPromise;
}

function present(item: EventRecord, baseURL: string): EventSummary {
  return {
    id: item.id,
    slug: item.slug,
    program: item.program,
    title: item.title,
    excerpt: item.excerpt,
    startsAt: item.startsAt,
    dateText: item.dateText,
    poster: item.poster ? withBase(baseURL, item.poster) : undefined,
  };
}

function cards(items: EventRecord[], program?: EventProgram) {
  return items.filter(
    (item) => !item.canonicalOf && (!program || item.program === program),
  );
}

function compare(left: EventRecord, right: EventRecord, direction: 1 | -1) {
  const leftKey = left.startsAt ?? "";
  const rightKey = right.startsAt ?? "";
  if (leftKey && rightKey && leftKey !== rightKey) {
    return leftKey.localeCompare(rightKey) * direction;
  }
  if (leftKey && !rightKey) return -1;
  if (!leftKey && rightKey) return 1;
  const published = (left.publishedAt ?? "").localeCompare(right.publishedAt ?? "");
  if (published !== 0) return published * direction;
  return (left.id - right.id) * direction;
}

function pickFeatured(items: EventRecord[], today: string) {
  const upcoming = items
    .filter((item) => item.startsAt && item.startsAt.slice(0, 10) >= today)
    .sort((left, right) => (left.startsAt ?? "").localeCompare(right.startsAt ?? ""));
  return upcoming[0] ?? [...items].sort((left, right) => compare(left, right, -1))[0];
}

export function createJsonEventRepository(baseURL: string): EventRepository {
  const href = (path: string) => withBase(baseURL, path);
  const indexPath = "/data/events/index.json";

  async function load() {
    return loadIndex(indexPath, href(indexPath));
  }

  return {
    async list(query: EventListQuery): Promise<EventList> {
      const index = await load();
      const pool = cards(index.items, query.program);
      const featured = pickFeatured(pool, tehranToday());
      const source =
        query.omitFeatured && featured
          ? pool.filter((item) => item.id !== featured.id)
          : pool;
      const direction = query.order === "asc" ? 1 : -1;
      const ordered = [...source].sort((left, right) =>
        compare(left, right, direction),
      );
      const total = ordered.length;
      const pages = total === 0 ? 0 : Math.ceil(total / query.perPage);
      const start = (query.page - 1) * query.perPage;
      return {
        items: ordered
          .slice(start, start + query.perPage)
          .map((item) => present(item, baseURL)),
        total,
        pages,
      };
    },
    async featured(program?: EventProgram): Promise<EventSummary | null> {
      const index = await load();
      const featured = pickFeatured(cards(index.items, program), tehranToday());
      return featured ? present(featured, baseURL) : null;
    },
    async get(slug: string): Promise<EventArticle | null> {
      if (reservedEventSlugs.has(slug)) return null;
      const index = await load();
      const record = index.items.find(
        (item) => item.slug === slug && !item.canonicalOf,
      );
      if (!record) return null;
      const related = [...cards(index.items, record.program)]
        .filter((item) => item.id !== record.id)
        .sort((left, right) => compare(left, right, -1))
        .slice(0, 3)
        .map((item) => present(item, baseURL));
      const prepared = articleHtml(record.bodyHtml || "", baseURL);
      return {
        ...present(record, baseURL),
        location: record.location,
        mode: record.mode,
        speakers: record.speakers,
        registrationUrl: record.registrationUrl,
        videoUrl: record.videoUrl,
        bodyHtml: prepared.html,
        related,
      };
    },
  };
}
