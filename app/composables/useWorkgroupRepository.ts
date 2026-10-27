import { createApiWorkgroupRepository } from "~/data/workgroups/api";
import { createJsonWorkgroupRepository } from "~/data/workgroups/json";
import type { WorkgroupRepository } from "~/data/workgroups/types";
import {
  repositoryWithJsonFallback,
  sectionApiBase,
  sectionMode,
} from "~/utils/contentSource";

export function useWorkgroupRepository(): WorkgroupRepository {
  const config = useRuntimeConfig();
  return repositoryWithJsonFallback(
    sectionMode(config.public, "workgroups"),
    createApiWorkgroupRepository(
      sectionApiBase(config.public, "workgroups"),
      config.app.baseURL,
    ),
    createJsonWorkgroupRepository(config.app.baseURL),
  );
}
