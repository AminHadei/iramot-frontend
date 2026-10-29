import type {
  TermList,
  TermListQuery,
  TermRepository,
  TermSource,
} from "~/data/terms/types";
import { fetchJsonOrNull } from "~/data/fetchJson";

const emptyList: TermList = { items: [], total: 0 };

export function createApiTermRepository(apiBase: string): TermRepository {
  const root = apiBase.replace(/\/$/, "");

  return {
    async list(query?: TermListQuery): Promise<TermList> {
      if (!root) return emptyList;
      const data = await fetchJsonOrNull<TermList>(`${root}/terms`, query);
      return data ?? emptyList;
    },
    async sources(): Promise<TermSource[]> {
      if (!root) return [];
      const data = await fetchJsonOrNull<TermSource[]>(`${root}/terms/sources`);
      return data ?? [];
    },
  };
}
