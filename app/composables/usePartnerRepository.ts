import { createApiPartnerRepository } from "~/data/partners/api";
import { createJsonPartnerRepository } from "~/data/partners/json";
import type { PartnerRepository } from "~/data/partners/types";

export function usePartnerRepository(): PartnerRepository {
  const config = useRuntimeConfig();
  if (config.public.partnersSource === "api") {
    return createApiPartnerRepository(config.public.partnersApiBase);
  }
  return createJsonPartnerRepository(config.app.baseURL);
}
