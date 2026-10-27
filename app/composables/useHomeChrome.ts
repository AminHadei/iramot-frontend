import { createApiHomeRepository } from "~/data/singletons/api";
import type { HomeContent } from "~/types/content";
import { sectionApiBase, sectionMode, withJsonFallback } from "~/utils/contentSource";

export function useHomeChrome() {
  const config = useRuntimeConfig();
  return useAsyncData("home-chrome", () =>
    withJsonFallback(
      sectionMode(config.public, "home"),
      () =>
        createApiHomeRepository(
          sectionApiBase(config.public, "home"),
          config.app.baseURL,
        ).get(),
      async () => (await queryCollection("home").first()) as HomeContent | null,
    ),
  );
}
