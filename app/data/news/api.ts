import type {
  NewsCategory,
  NewsList,
  NewsListQuery,
  NewsPost,
  NewsRepository,
} from "~/data/news/types";
import { articleHtml } from "~/utils/articleHtml";

const emptyList: NewsList = { items: [], total: 0, pages: 0 };

export function createApiNewsRepository(apiBase: string): NewsRepository {
  const root = apiBase.replace(/\/$/, "");

  return {
    async list(query: NewsListQuery): Promise<NewsList> {
      if (!root) return emptyList;
      return $fetch<NewsList>(`${root}/news`, { query });
    },
    async get(slug: string): Promise<NewsPost | null> {
      if (!root) return null;
      const post = await $fetch<NewsPost>(`${root}/news/${encodeURIComponent(slug)}`);
      const prepared = articleHtml(post.contentHtml || "");
      return { ...post, contentHtml: prepared.html };
    },
    async categories(): Promise<NewsCategory[]> {
      if (!root) return [];
      return $fetch<NewsCategory[]>(`${root}/news/categories`);
    },
  };
}
