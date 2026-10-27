import { createApiHomeRepository } from "~/data/singletons/api";

export function useHomeChrome() {
  const config = useRuntimeConfig();
  const base = useContentApiBase();
  return useAsyncData("home-chrome", () =>
    createApiHomeRepository(base, config.app.baseURL).get(),
  );
}
