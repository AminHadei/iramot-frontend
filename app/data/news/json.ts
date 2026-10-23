import type {
  NewsIndexFile,
  NewsIndexItem,
  NewsList,
  NewsListQuery,
  NewsPost,
  NewsRepository,
  NewsSummary,
} from "~/data/news/types";
import { articleHtml } from "~/utils/articleHtml";
import { withBase } from "~/utils/withBase";

let indexPromise: Promise<NewsIndexFile> | null = null;
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

function loadIndex(path: string, href: string): Promise<NewsIndexFile> {
  const key = import.meta.server ? path : href;
  if (!indexPromise || indexBase !== key) {
    indexBase = key;
    const request = import.meta.server
      ? readPublic<NewsIndexFile>(path)
      : $fetch<NewsIndexFile>(href);
    indexPromise = request.catch((error: unknown) => {
      indexPromise = null;
      throw error;
    });
  }
  return indexPromise;
}

function present(item: NewsIndexItem | NewsPost, baseURL: string): NewsSummary {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    date: item.date,
    excerpt: item.excerpt,
    image: item.image
      ? { ...item.image, url: withBase(baseURL, item.image.url) }
      : null,
    categories: item.categories,
    author: item.author,
  };
}

function matchesAuthor(item: NewsSummary, author: string) {
  if (!item.author) return false;
  return item.author.slug === author || String(item.author.id) === author;
}

export function createJsonNewsRepository(baseURL: string): NewsRepository {
  const href = (path: string) => withBase(baseURL, path);
  const indexPath = "/data/news/index.json";

  return {
    async list(query: NewsListQuery): Promise<NewsList> {
      const index = await loadIndex(indexPath, href(indexPath));
      let items = index.items.filter((item) =>
        query.category
          ? item.categories.some((category) => category.slug === query.category)
          : item.feed,
      );
      if (query.author) {
        items = items.filter((item) => matchesAuthor(item, query.author ?? ""));
      }
      const direction = query.order === "asc" ? 1 : -1;
      items = [...items].sort((left, right) => {
        const byDate = left.date.localeCompare(right.date);
        if (byDate !== 0) return byDate * direction;
        return (left.id - right.id) * direction;
      });
      const pool = items.slice(Math.max(0, query.skip ?? 0));
      const total = pool.length;
      const pages = total === 0 ? 0 : Math.ceil(total / query.perPage);
      const start = (query.page - 1) * query.perPage;
      return {
        items: pool
          .slice(start, start + query.perPage)
          .map((item) => present(item, baseURL)),
        total,
        pages,
      };
    },
    async get(slug: string): Promise<NewsPost | null> {
      const index = await loadIndex(indexPath, href(indexPath));
      const summary = index.items.find((item) => item.slug === slug);
      if (!summary) return null;
      const postPath = `/data/news/posts/${summary.id}.json`;
      const raw = import.meta.server
        ? await readPublic<NewsPost>(postPath)
        : await $fetch<NewsPost>(href(postPath));
      const slugs = new Set(index.items.map((item) => item.slug));
      const prepared = articleHtml(raw.contentHtml || "", baseURL, slugs);
      return {
        ...present({ ...summary, ...raw, feed: summary.feed }, baseURL),
        contentHtml: prepared.html,
      };
    },
    async categories() {
      const index = await loadIndex(indexPath, href(indexPath));
      return index.filters;
    },
  };
}
