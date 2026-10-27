import { createApiAreaRepository } from "~/data/areas/api";
import type { FocusArea } from "~/types/content";
import { sectionApiBase, sectionMode, withJsonFallback } from "~/utils/contentSource";

export function useAreaRepository() {
  const config = useRuntimeConfig();
  return {
    list(): Promise<FocusArea[]> {
      return withJsonFallback(
        sectionMode(config.public, "areas"),
        () => createApiAreaRepository(sectionApiBase(config.public, "areas")).list(),
        async () =>
          (await queryCollection("areas").order("stem", "ASC").all()) as FocusArea[],
      );
    },
  };
}
