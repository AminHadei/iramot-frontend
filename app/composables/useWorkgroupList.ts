import type { NuxtApp } from "#app";
import type { WorkgroupList } from "~/data/workgroups/types";

export function useWorkgroupList() {
  const repo = useWorkgroupRepository();
  return useAsyncData("workgroup-list", () => repo.list(), {
    getCachedData(key, nuxtApp: NuxtApp) {
      if (!nuxtApp.isHydrating) return undefined;
      return nuxtApp.payload.data[key] as WorkgroupList | undefined;
    },
  });
}
