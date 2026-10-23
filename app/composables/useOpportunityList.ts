import type { NuxtApp } from "#app";
import type { OpportunityList } from "~/data/opportunities/types";

export function useOpportunityList() {
  const repo = useOpportunityRepository();
  return useAsyncData("opportunity-list", () => repo.list(), {
    getCachedData(key, nuxtApp: NuxtApp) {
      if (!nuxtApp.isHydrating) return undefined;
      return nuxtApp.payload.data[key] as OpportunityList | undefined;
    },
  });
}
