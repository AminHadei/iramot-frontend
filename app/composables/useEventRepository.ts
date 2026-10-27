import { createApiEventRepository } from "~/data/events/api";
import { createJsonEventRepository } from "~/data/events/json";
import type { EventRepository } from "~/data/events/types";
import {
  repositoryWithJsonFallback,
  sectionApiBase,
  sectionMode,
} from "~/utils/contentSource";

export function useEventRepository(): EventRepository {
  const config = useRuntimeConfig();
  return repositoryWithJsonFallback(
    sectionMode(config.public, "events"),
    createApiEventRepository(
      sectionApiBase(config.public, "events"),
      config.app.baseURL,
    ),
    createJsonEventRepository(config.app.baseURL),
  );
}
