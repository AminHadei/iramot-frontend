import type { QuarterlyList, QuarterlyRepository } from "~/data/quarterlies/types";

const emptyList: QuarterlyList = { items: [] };

export function createApiQuarterlyRepository(apiBase: string): QuarterlyRepository {
  const root = apiBase.replace(/\/$/, "");

  return {
    async list(): Promise<QuarterlyList> {
      if (!root) return emptyList;
      return $fetch<QuarterlyList>(`${root}/quarterlies`);
    },
  };
}
