import type { GuideContent } from "~/types/content";
import { fetchJsonOrNull } from "~/data/fetchJson";
import { asPage } from "~/utils/pageResult";

export interface GuideRepository {
  list(): Promise<GuideContent[]>;
  get(key: string): Promise<GuideContent | null>;
}

export function createApiGuideRepository(apiBase: string): GuideRepository {
  const root = apiBase.replace(/\/$/, "");
  return {
    async list() {
      if (!root) return [];
      const body = await fetchJsonOrNull<GuideContent[] | { items: GuideContent[] }>(
        `${root}/guides`,
      );
      if (!body) return [];
      return Array.isArray(body) ? body : asPage<GuideContent>(body).items;
    },
    async get(key: string) {
      if (!root) return null;
      return fetchJsonOrNull<GuideContent>(`${root}/guides/${encodeURIComponent(key)}`);
    },
  };
}
