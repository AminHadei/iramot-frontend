import type {
  TermList,
  TermListQuery,
  TermRepository,
  TermSource,
} from "~/data/terms/types";

const emptyList: TermList = { items: [], total: 0 };

export function createApiTermRepository(apiBase: string): TermRepository {
  const root = apiBase.replace(/\/$/, "");

  return {
    async list(query?: TermListQuery): Promise<TermList> {
      if (!root) return emptyList;
      return $fetch<TermList>(`${root}/terms`, { query });
    },
    async sources(): Promise<TermSource[]> {
      if (!root) return [];
      return $fetch<TermSource[]>(`${root}/terms/sources`);
    },
  };
}
