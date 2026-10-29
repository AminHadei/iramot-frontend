import { createApiOpportunityRepository } from "~/data/opportunities/api";
import type { OpportunityRepository } from "~/data/opportunities/types";

export function useOpportunityRepository(): OpportunityRepository {
  const config = useRuntimeConfig();
  return createApiOpportunityRepository(useContentApiBase(), config.app.baseURL);
}
