import { createApiAreaRepository } from "~/data/areas/api";
import type { FocusArea } from "~/types/content";

export function useAreaRepository() {
  const base = useContentApiBase();
  return {
    list(): Promise<FocusArea[]> {
      return createApiAreaRepository(base).list();
    },
  };
}
