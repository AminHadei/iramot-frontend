import type { FocusArea } from "~/types/content";
import { fetchJsonOrNull } from "~/data/fetchJson";
import { asPage } from "~/utils/pageResult";

export interface AreaRepository {
  list(): Promise<FocusArea[]>;
}

export function createApiAreaRepository(apiBase: string): AreaRepository {
  const root = apiBase.replace(/\/$/, "");
  return {
    async list() {
      if (!root) return [];
      const body = await fetchJsonOrNull<FocusArea[] | { items: FocusArea[] }>(
        `${root}/areas`,
      );
      if (!body) return [];
      return Array.isArray(body) ? body : asPage<FocusArea>(body).items;
    },
  };
}
