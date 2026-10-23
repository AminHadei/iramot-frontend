import { createJsonWorkgroupRepository } from "~/data/workgroups/json";
import type { WorkgroupRepository } from "~/data/workgroups/types";

export function useWorkgroupRepository(): WorkgroupRepository {
  return createJsonWorkgroupRepository(useRuntimeConfig().app.baseURL);
}
