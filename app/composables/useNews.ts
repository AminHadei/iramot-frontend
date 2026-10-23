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
  topic?: string;
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
      const sameTopic = post.topic
        ? await repo.list({
            page: 1,
            perPage: 8,
            topic: post.topic,
            order: "desc",
          })
        : { items: [] as NewsSummary[] };
      const rest = await repo.list({
        page: 1,
        perPage: 8,
        category: category && category.slug !== "news" ? category.slug : undefined,
        order: "desc",
      });
      const seen = new Set<number>([post.id]);
      const related: NewsSummary[] = [];
      for (const item of [...sameTopic.items, ...rest.items]) {
        if (seen.has(item.id)) continue;
        seen.add(item.id);
        related.push(item);
        if (related.length === 3) break;
      }
      return {
        ...post,
        contentHtml: prepared.html,
        toc: prepared.toc,
        related,
      };
    },
  );
}
