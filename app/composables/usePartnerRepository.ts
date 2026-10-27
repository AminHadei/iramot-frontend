import { createApiPartnerRepository } from "~/data/partners/api";
import { createJsonPartnerRepository } from "~/data/partners/json";
import type { PartnerRepository } from "~/data/partners/types";
import {
  repositoryWithJsonFallback,
  sectionApiBase,
  sectionMode,
} from "~/utils/contentSource";

export function usePartnerRepository(): PartnerRepository {
  const config = useRuntimeConfig();
  return repositoryWithJsonFallback(
    sectionMode(config.public, "partners"),
    createApiPartnerRepository(
      sectionApiBase(config.public, "partners"),
      config.app.baseURL,
    ),
    createJsonPartnerRepository(config.app.baseURL),
  );
}
