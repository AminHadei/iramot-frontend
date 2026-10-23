import { createApiQuarterlyRepository } from "~/data/quarterlies/api";
import { createJsonQuarterlyRepository } from "~/data/quarterlies/json";
import type { QuarterlyRepository } from "~/data/quarterlies/types";

export function useQuarterlyRepository(): QuarterlyRepository {
  const config = useRuntimeConfig();
  if (config.public.quarterliesSource === "api") {
    return createApiQuarterlyRepository(config.public.quarterliesApiBase);
  }
  return createJsonQuarterlyRepository(config.app.baseURL);
}
