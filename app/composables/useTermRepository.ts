import { createApiTermRepository } from "~/data/terms/api";
import { createJsonTermRepository } from "~/data/terms/json";
import type { TermRepository } from "~/data/terms/types";

export function useTermRepository(): TermRepository {
  const config = useRuntimeConfig();
  if (config.public.termsSource === "api") {
    return createApiTermRepository(config.public.termsApiBase);
  }
  return createJsonTermRepository(config.app.baseURL);
}
