import { createApiSiteRepository } from "~/data/singletons/api";
import { sectionApiBase, sectionMode, withJsonFallback } from "~/utils/contentSource";

export function useSite() {
  const config = useRuntimeConfig();
  return useAsyncData("site", () =>
    withJsonFallback(
      sectionMode(config.public, "site"),
      () =>
        createApiSiteRepository(
          sectionApiBase(config.public, "site"),
          config.app.baseURL,
        ).get(),
      () => queryCollection("site").first(),
    ),
  );
}
