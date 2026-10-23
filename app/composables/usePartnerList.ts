import type { NuxtApp } from "#app";
import type { PartnerList } from "~/data/partners/types";

export function usePartnerList() {
  const repo = usePartnerRepository();
  return useAsyncData("partner-list", () => repo.list(), {
    getCachedData(key, nuxtApp: NuxtApp) {
      if (!nuxtApp.isHydrating) return undefined;
      return nuxtApp.payload.data[key] as PartnerList | undefined;
    },
  });
}
