import { createApiResearchRepository } from "~/data/research/api";

export function useResearchRepository() {
  const config = useRuntimeConfig();
  const api = () =>
    createApiResearchRepository(useContentApiBase(), config.app.baseURL);
  return {
    list() {
      return api().list();
    },
    get(slug: string) {
      return api().get(slug);
    },
  };
}
