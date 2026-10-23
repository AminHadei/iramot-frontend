import type { NuxtApp } from "#app";
import type { EventArticle } from "~/data/events/types";

export function useEvent(slug: string) {
  const repo = useEventRepository();
  return useAsyncData(`event-${slug}`, () => repo.get(slug), {
    getCachedData(key, nuxtApp: NuxtApp) {
      if (!nuxtApp.isHydrating) return undefined;
      return nuxtApp.payload.data[key] as EventArticle | null | undefined;
    },
  });
}
