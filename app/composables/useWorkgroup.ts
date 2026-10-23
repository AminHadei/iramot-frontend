import type { NuxtApp } from "#app";
import type { WorkgroupArticle } from "~/data/workgroups/types";

export function useWorkgroup(slug: string) {
  const repo = useWorkgroupRepository();
  return useAsyncData(`workgroup-${slug}`, () => repo.get(slug), {
    getCachedData(key, nuxtApp: NuxtApp) {
      if (!nuxtApp.isHydrating) return undefined;
      return nuxtApp.payload.data[key] as WorkgroupArticle | null | undefined;
    },
  });
}
