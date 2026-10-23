import type { NuxtApp } from "#app";
import type { QuarterlyList } from "~/data/quarterlies/types";

export function useQuarterlyList() {
  const repo = useQuarterlyRepository();
  return useAsyncData("quarterly-list", () => repo.list(), {
    getCachedData(key, nuxtApp: NuxtApp) {
      if (!nuxtApp.isHydrating) return undefined;
      return nuxtApp.payload.data[key] as QuarterlyList | undefined;
    },
  });
}
