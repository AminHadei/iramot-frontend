import { createApiResearchRepository } from "~/data/research/api";
import { sectionApiBase, sectionMode, withJsonFallback } from "~/utils/contentSource";

export function useResearchRepository() {
  const config = useRuntimeConfig();
  const api = () =>
    createApiResearchRepository(
      sectionApiBase(config.public, "research"),
      config.app.baseURL,
    );
  return {
    list() {
      return withJsonFallback(
        sectionMode(config.public, "research"),
        () => api().list(),
        () => Promise.resolve([]),
      );
    },
    get(slug: string) {
      return withJsonFallback(
        sectionMode(config.public, "research"),
        () => api().get(slug),
        () => Promise.resolve(null),
      );
    },
  };
}
