import { createApiEventRepository } from "~/data/events/api";
import { createJsonEventRepository } from "~/data/events/json";
import type { EventRepository } from "~/data/events/types";

export function useEventRepository(): EventRepository {
  const config = useRuntimeConfig();
  if (config.public.eventsSource === "api") {
    return createApiEventRepository(config.public.eventsApiBase);
  }
  return createJsonEventRepository(config.app.baseURL);
}
