import { createApiOpportunityRepository } from "~/data/opportunities/api";
import { createJsonOpportunityRepository } from "~/data/opportunities/json";
import type { OpportunityRepository } from "~/data/opportunities/types";

export function useOpportunityRepository(): OpportunityRepository {
  const config = useRuntimeConfig();
  if (config.public.opportunitiesSource === "api") {
    return createApiOpportunityRepository(config.public.opportunitiesApiBase);
  }
  return createJsonOpportunityRepository(
    config.app.baseURL,
    config.public.opportunitiesSamples !== false,
  );
}
