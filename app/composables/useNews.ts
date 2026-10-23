import type { ArticleHeading } from "~/utils/articleHtml";
import type { NewsSummary } from "~/data/news/types";

export interface NewsArticleView {
  id: number;
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  image: NewsSummary["image"];
  categories: NewsSummary["categories"];
  author: NewsSummary["author"];
  contentHtml: string;
  toc: ArticleHeading[];
  related: NewsSummary[];
}

export function useNews(slug: string) {
  const repo = useNewsRepository();
  const baseURL = useRuntimeConfig().app.baseURL;

  return useAsyncData(
    `news-post-${slug}`,
    async (): Promise<NewsArticleView | null> => {
      const post = await repo.get(slug);
      if (!post) return null;
      const prepared = articleHtml(post.contentHtml, baseURL);
      const category = primaryNewsCategory(post.categories);
      const relatedList = await repo.list({
        page: 1,
        perPage: 8,
        category: category && category.slug !== "news" ? category.slug : undefined,
        order: "desc",
      });
      return {
        ...post,
        contentHtml: prepared.html,
        toc: prepared.toc,
        related: relatedList.items.filter((item) => item.id !== post.id).slice(0, 3),
      };
    },
  );
}
