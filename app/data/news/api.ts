import type {
  NewsCategory,
  NewsList,
  NewsListQuery,
  NewsPost,
  NewsRepository,
  NewsSummary,
} from "~/data/news/types";
import { useMediaRewriteBase } from "~/composables/useContentApiBase";
import { fetchJsonOrNull } from "~/data/fetchJson";
import { articleHtml } from "~/utils/articleHtml";
import {
  rewriteMediaTree,
  rewriteStorageHtml,
  type MediaContext,
} from "~/utils/mediaUrl";

const emptyList: NewsList = { items: [], total: 0, pages: 0 };

export function createApiNewsRepository(
  apiBase: string,
  siteBase = "/",
): NewsRepository {
  const root = apiBase.replace(/\/$/, "");
  const mediaRoot = useMediaRewriteBase(root);
  const media: MediaContext = { apiBase: mediaRoot, siteBase };

  function mapSummary<T extends NewsSummary>(item: T): T {
    return rewriteMediaTree(item, media);
  }

  return {
    async list(query: NewsListQuery): Promise<NewsList> {
      if (!root) return emptyList;
      const data = await $fetch<NewsList>(`${root}/news`, { query });
      return { ...data, items: (data.items ?? []).map((item) => mapSummary(item)) };
    },
    async get(slug: string): Promise<NewsPost | null> {
      if (!root) return null;
      const post = await fetchJsonOrNull<NewsPost>(
        `${root}/news/${encodeURIComponent(slug)}`,
      );
      if (!post) return null;
      const prepared = articleHtml(
        rewriteStorageHtml(post.contentHtml || "", mediaRoot),
        siteBase,
        undefined,
        mediaRoot,
      );
      return { ...mapSummary(post), contentHtml: prepared.html };
    },
    async categories(): Promise<NewsCategory[]> {
      if (!root) return [];
      return $fetch<NewsCategory[]>(`${root}/news/categories`);
    },
  };
}
