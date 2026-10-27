import type {
  Opportunity,
  OpportunityList,
  OpportunityRepository,
} from "~/data/opportunities/types";
import { asPage } from "~/utils/pageResult";
import { rewriteMediaTree, type MediaContext } from "~/utils/mediaUrl";

const emptyList: OpportunityList = { items: [] };

export function createApiOpportunityRepository(
  apiBase: string,
  siteBase = "/",
  includeSamples = true,
): OpportunityRepository {
  const root = apiBase.replace(/\/$/, "");
  const media: MediaContext = { apiBase: root, siteBase };

  return {
    async list(): Promise<OpportunityList> {
      if (!root) return emptyList;
      const body = await $fetch<OpportunityList | Opportunity[]>(
        `${root}/opportunities`,
        {
          query: { samples: includeSamples ? "1" : "0" },
        },
      );
      const items = Array.isArray(body) ? body : asPage<Opportunity>(body).items;
      const visible = includeSamples
        ? items
        : items.filter((item) => item.sample !== true);
      return {
        items: visible.map((item, index) => ({
          ...rewriteMediaTree(item, media),
          tone: (index % 3) as 0 | 1 | 2,
        })),
      };
    },
  };
}
