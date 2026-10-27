import { createApiPartnerRepository } from "~/data/partners/api";
import type { PartnerRepository } from "~/data/partners/types";

export function usePartnerRepository(): PartnerRepository {
  const config = useRuntimeConfig();
  return createApiPartnerRepository(useContentApiBase(), config.app.baseURL);
}
