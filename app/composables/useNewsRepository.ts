import { createApiNewsRepository } from "~/data/news/api";
import type { NewsRepository } from "~/data/news/types";

export function useNewsRepository(): NewsRepository {
  const config = useRuntimeConfig();
  return createApiNewsRepository(useContentApiBase(), config.app.baseURL);
}
