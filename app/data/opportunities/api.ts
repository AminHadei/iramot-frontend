import type {
  OpportunityList,
  OpportunityRepository,
} from "~/data/opportunities/types";

const emptyList: OpportunityList = { items: [] };

export function createApiOpportunityRepository(apiBase: string): OpportunityRepository {
  const root = apiBase.replace(/\/$/, "");

  return {
    async list(): Promise<OpportunityList> {
      if (!root) return emptyList;
      return $fetch<OpportunityList>(`${root}/opportunities`);
    },
  };
}
