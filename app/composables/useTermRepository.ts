import { createApiTermRepository } from "~/data/terms/api";
import { createJsonTermRepository } from "~/data/terms/json";
import type { TermRepository } from "~/data/terms/types";
import {
  repositoryWithJsonFallback,
  sectionApiBase,
  sectionMode,
} from "~/utils/contentSource";

export function useTermRepository(): TermRepository {
  const config = useRuntimeConfig();
  return repositoryWithJsonFallback(
    sectionMode(config.public, "terms"),
    createApiTermRepository(sectionApiBase(config.public, "terms")),
    createJsonTermRepository(config.app.baseURL),
  );
}
