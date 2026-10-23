export const newsPageSize = 15;

export interface NewsImage {
  url: string;
  width: number;
  height: number;
  alt: string;
}

export interface NewsCategory {
  slug: string;
  name: string;
}

export interface NewsAuthor {
  id: number;
  name: string | null;
  slug: string | null;
}

export interface NewsSummary {
  id: number;
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  image: NewsImage | null;
  categories: NewsCategory[];
  author: NewsAuthor | null;
  topic?: string;
}

export interface NewsPost extends NewsSummary {
  contentHtml: string;
}

export interface NewsListQuery {
  page: number;
  perPage: number;
  category?: string;
  topic?: string;
  order?: "asc" | "desc";
  author?: string;
  skip?: number;
}

export interface NewsList {
  items: NewsSummary[];
  total: number;
  pages: number;
}

export interface NewsRepository {
  list(query: NewsListQuery): Promise<NewsList>;
  get(slug: string): Promise<NewsPost | null>;
  categories(): Promise<NewsCategory[]>;
}

export interface NewsIndexItem extends NewsSummary {
  feed: boolean;
}

export interface NewsIndexFile {
  filters: NewsCategory[];
  items: NewsIndexItem[];
}
