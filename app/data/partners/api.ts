import type { Partner, PartnerList, PartnerRepository } from "~/data/partners/types";
import { asPage } from "~/utils/pageResult";
import { rewriteMediaTree, type MediaContext } from "~/utils/mediaUrl";

const emptyList: PartnerList = { items: [] };

export function createApiPartnerRepository(
  apiBase: string,
  siteBase = "/",
): PartnerRepository {
  const root = apiBase.replace(/\/$/, "");
  const media: MediaContext = { apiBase: root, siteBase };

  return {
    async list(): Promise<PartnerList> {
      if (!root) return emptyList;
      const body = await $fetch<PartnerList | Partner[]>(`${root}/partners`);
      const items = (Array.isArray(body) ? body : asPage<Partner>(body).items).map(
        (item, index) => ({
          ...rewriteMediaTree(item, media),
          tone: (item.tone ?? index % 3) as 0 | 1 | 2,
        }),
      );
      return { items };
    },
  };
}
