import { createApiProjectRepository, type ProjectRecord } from "~/data/projects/api";
import { sectionApiBase, sectionMode, withJsonFallback } from "~/utils/contentSource";

export function useProjectRepository() {
  const config = useRuntimeConfig();
  const api = () =>
    createApiProjectRepository(
      sectionApiBase(config.public, "projects"),
      config.app.baseURL,
    );
  return {
    list() {
      return withJsonFallback(
        sectionMode(config.public, "projects"),
        () => api().list(),
        async () =>
          (await queryCollection("projects")
            .order("stem", "ASC")
            .all()) as unknown as ProjectRecord[],
      );
    },
    get(slug: string) {
      return withJsonFallback(
        sectionMode(config.public, "projects"),
        () => api().get(slug),
        () => queryCollection("projects").path(`/projects/${slug}`).first(),
      );
    },
  };
}
