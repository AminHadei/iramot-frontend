import { useMediaRewriteBase } from "~/composables/useContentApiBase";
import { fetchJsonOrNull } from "~/data/fetchJson";
import { asPage } from "~/utils/pageResult";
import {
  rewriteMediaTree,
  rewriteStorageHtml,
  type MediaContext,
} from "~/utils/mediaUrl";

export interface ResearchRecord {
  slug: string;
  path: string;
  title: string;
  description: string;
  date?: string;
  category?: string;
  authors: string[];
  image?: string;
  bodyHtml?: string;
}

export interface ResearchRepository {
  list(): Promise<ResearchRecord[]>;
  get(slug: string): Promise<ResearchRecord | null>;
}

export function createApiResearchRepository(
  apiBase: string,
  siteBase = "/",
): ResearchRepository {
  const root = apiBase.replace(/\/$/, "");
  const mediaRoot = useMediaRewriteBase(root);
  const media: MediaContext = { apiBase: mediaRoot, siteBase };

  function present(item: ResearchRecord): ResearchRecord {
    const next = rewriteMediaTree(item, media);
    return {
      ...next,
      path: next.path || `/news/${next.slug}`,
      authors: next.authors ?? [],
      bodyHtml: next.bodyHtml
        ? rewriteStorageHtml(next.bodyHtml, mediaRoot)
        : next.bodyHtml,
    };
  }

  return {
    async list() {
      if (!root) return [];
      const body = await fetchJsonOrNull<
        ResearchRecord[] | { items: ResearchRecord[] }
      >(`${root}/research`);
      if (!body) return [];
      const items = Array.isArray(body) ? body : asPage<ResearchRecord>(body).items;
      return items.map(present);
    },
    async get(slug: string) {
      if (!root) return null;
      const item = await fetchJsonOrNull<ResearchRecord>(
        `${root}/research/${encodeURIComponent(slug)}`,
      );
      return item ? present(item) : null;
    },
  };
}
