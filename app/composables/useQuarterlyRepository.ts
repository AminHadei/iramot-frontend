import { createApiQuarterlyRepository } from "~/data/quarterlies/api";
import type { QuarterlyRepository } from "~/data/quarterlies/types";

export function useQuarterlyRepository(): QuarterlyRepository {
  const config = useRuntimeConfig();
  return createApiQuarterlyRepository(useContentApiBase(), config.app.baseURL);
}
