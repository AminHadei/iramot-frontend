import { createApiOpportunityRepository } from "~/data/opportunities/api";
import { createJsonOpportunityRepository } from "~/data/opportunities/json";
import type { OpportunityRepository } from "~/data/opportunities/types";
import {
  repositoryWithJsonFallback,
  sectionApiBase,
  sectionMode,
} from "~/utils/contentSource";

export function useOpportunityRepository(): OpportunityRepository {
  const config = useRuntimeConfig();
  const samples = config.public.opportunitiesSamples !== false;
  return repositoryWithJsonFallback(
    sectionMode(config.public, "opportunities"),
    createApiOpportunityRepository(
      sectionApiBase(config.public, "opportunities"),
      config.app.baseURL,
      samples,
    ),
    createJsonOpportunityRepository(config.app.baseURL, samples),
  );
}
