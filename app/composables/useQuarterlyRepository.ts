import { createApiQuarterlyRepository } from "~/data/quarterlies/api";
import { createJsonQuarterlyRepository } from "~/data/quarterlies/json";
import type { QuarterlyRepository } from "~/data/quarterlies/types";
import {
  repositoryWithJsonFallback,
  sectionApiBase,
  sectionMode,
} from "~/utils/contentSource";

export function useQuarterlyRepository(): QuarterlyRepository {
  const config = useRuntimeConfig();
  return repositoryWithJsonFallback(
    sectionMode(config.public, "quarterlies"),
    createApiQuarterlyRepository(
      sectionApiBase(config.public, "quarterlies"),
      config.app.baseURL,
    ),
    createJsonQuarterlyRepository(config.app.baseURL),
  );
}
