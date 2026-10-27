import { createApiNewsRepository } from "~/data/news/api";
import { createJsonNewsRepository } from "~/data/news/json";
import type { NewsRepository } from "~/data/news/types";
import {
  repositoryWithJsonFallback,
  sectionApiBase,
  sectionMode,
} from "~/utils/contentSource";

export function useNewsRepository(): NewsRepository {
  const config = useRuntimeConfig();
  return repositoryWithJsonFallback(
    sectionMode(config.public, "news"),
    createApiNewsRepository(sectionApiBase(config.public, "news"), config.app.baseURL),
    createJsonNewsRepository(config.app.baseURL),
  );
}
