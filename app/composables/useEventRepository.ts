import { createApiEventRepository } from "~/data/events/api";
import type { EventRepository } from "~/data/events/types";

export function useEventRepository(): EventRepository {
  const config = useRuntimeConfig();
  return createApiEventRepository(useContentApiBase(), config.app.baseURL);
}
