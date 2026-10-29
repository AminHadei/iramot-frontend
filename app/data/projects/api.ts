import { useMediaRewriteBase } from "~/composables/useContentApiBase";
import { fetchJsonOrNull } from "~/data/fetchJson";
import { asPage } from "~/utils/pageResult";
import {
  rewriteMediaTree,
  rewriteStorageHtml,
  type MediaContext,
} from "~/utils/mediaUrl";

export interface ProjectRecord {
  slug: string;
  path: string;
  title: string;
  description: string;
  authors: string[];
  image?: string;
  bodyHtml?: string;
}

export interface ProjectRepository {
  list(): Promise<ProjectRecord[]>;
  get(slug: string): Promise<ProjectRecord | null>;
}

export function createApiProjectRepository(
  apiBase: string,
  siteBase = "/",
): ProjectRepository {
  const root = apiBase.replace(/\/$/, "");
  const mediaRoot = useMediaRewriteBase(root);
  const media: MediaContext = { apiBase: mediaRoot, siteBase };

  function present(item: ProjectRecord): ProjectRecord {
    const next = rewriteMediaTree(item, media);
    return {
      ...next,
      path: next.path || `/projects/${next.slug}`,
      authors: next.authors ?? [],
      bodyHtml: next.bodyHtml
        ? rewriteStorageHtml(next.bodyHtml, mediaRoot)
        : next.bodyHtml,
    };
  }

  return {
    async list() {
      if (!root) return [];
      const body = await fetchJsonOrNull<ProjectRecord[] | { items: ProjectRecord[] }>(
        `${root}/projects`,
      );
      if (!body) return [];
      const items = Array.isArray(body) ? body : asPage<ProjectRecord>(body).items;
      return items.map(present);
    },
    async get(slug: string) {
      if (!root) return null;
      const item = await fetchJsonOrNull<ProjectRecord>(
        `${root}/projects/${encodeURIComponent(slug)}`,
      );
      return item ? present(item) : null;
    },
  };
}
