import { createApiNewsRepository } from "~/data/news/api";
import { createJsonNewsRepository } from "~/data/news/json";
import type { NewsRepository } from "~/data/news/types";

export function useNewsRepository(): NewsRepository {
  const config = useRuntimeConfig();
  if (config.public.newsSource === "api") {
    return createApiNewsRepository(config.public.newsApiBase);
  }
  return createJsonNewsRepository(config.app.baseURL);
}
