import { createApiProjectRepository, type ProjectRecord } from "~/data/projects/api";

export function useProjectRepository() {
  const config = useRuntimeConfig();
  const api = () => createApiProjectRepository(useContentApiBase(), config.app.baseURL);
  return {
    list(): Promise<ProjectRecord[]> {
      return api().list();
    },
    get(slug: string) {
      return api().get(slug);
    },
  };
}
