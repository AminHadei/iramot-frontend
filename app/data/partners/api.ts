import type { PartnerList, PartnerRepository } from "~/data/partners/types";

const emptyList: PartnerList = { items: [] };

export function createApiPartnerRepository(apiBase: string): PartnerRepository {
  const root = apiBase.replace(/\/$/, "");

  return {
    async list(): Promise<PartnerList> {
      if (!root) return emptyList;
      return $fetch<PartnerList>(`${root}/partners`);
    },
  };
}
