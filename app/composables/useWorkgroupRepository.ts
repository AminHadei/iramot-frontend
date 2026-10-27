import { createApiWorkgroupRepository } from "~/data/workgroups/api";
import type { WorkgroupRepository } from "~/data/workgroups/types";

export function useWorkgroupRepository(): WorkgroupRepository {
  const config = useRuntimeConfig();
  return createApiWorkgroupRepository(useContentApiBase(), config.app.baseURL);
}
