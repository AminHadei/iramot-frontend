import type {
  TermIndexFile,
  TermIndexItem,
  TermList,
  TermListQuery,
  TermRepository,
  TermSource,
  TermSummary,
} from "~/data/terms/types";
import { compareByDateDesc } from "~/utils/persianSearch";
import { withBase } from "~/utils/withBase";

let indexPromise: Promise<TermIndexFile> | null = null;
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

function loadIndex(path: string, href: string): Promise<TermIndexFile> {
  const key = import.meta.server ? path : href;
  if (!indexPromise || indexBase !== key) {
    indexBase = key;
    const request = import.meta.server
      ? readPublic<TermIndexFile>(path)
      : $fetch<TermIndexFile>(href);
    indexPromise = request.catch((error: unknown) => {
      indexPromise = null;
      throw error;
    });
  }
  return indexPromise;
}

function present(item: TermIndexItem, labels: Map<number, string>): TermSummary {
  const sources: TermSource[] = [];
  for (const id of item.sources) {
    const label = labels.get(id);
    if (label) sources.push({ id, label });
  }
  return {
    id: item.id,
    title: item.title,
    fa: item.fa,
    text: item.text,
    sources,
    date: item.date,
    slug: item.slug,
  };
}

function searchable(item: TermIndexItem) {
  return {
    id: item.id,
    en: item.title,
    fa: item.fa,
    text: item.text,
    sources: item.sources,
    date: item.date,
  };
}

export function createJsonTermRepository(baseURL: string): TermRepository {
  const href = (path: string) => withBase(baseURL, path);
  const indexPath = "/data/terms/index.json";

  return {
    async list(query?: TermListQuery): Promise<TermList> {
      const index = await loadIndex(indexPath, href(indexPath));
      const exclude = new Set(query?.exclude ?? []);
      let items = index.items.filter((item) => !exclude.has(item.id));
      if (query?.source != null) {
        const source = query.source;
        items = items.filter((item) => item.sources.includes(source));
      }
      items = items
        .slice()
        .sort((left, right) => compareByDateDesc(searchable(left), searchable(right)));
      const labels = new Map(index.sources.map((source) => [source.id, source.label]));
      return {
        items: items.map((item) => present(item, labels)),
        total: items.length,
      };
    },
    async sources() {
      const index = await loadIndex(indexPath, href(indexPath));
      return index.sources;
    },
  };
}
