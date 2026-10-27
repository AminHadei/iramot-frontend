import { createApiSiteRepository } from "~/data/singletons/api";

export function useSite() {
  const config = useRuntimeConfig();
  const base = useContentApiBase();
  return useAsyncData("site", () =>
    createApiSiteRepository(base, config.app.baseURL).get(),
  );
}
