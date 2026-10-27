import type {
  Quarterly,
  QuarterlyList,
  QuarterlyRepository,
} from "~/data/quarterlies/types";
import { asPage } from "~/utils/pageResult";
import { rewriteMediaTree, type MediaContext } from "~/utils/mediaUrl";

const emptyList: QuarterlyList = { items: [] };

export function createApiQuarterlyRepository(
  apiBase: string,
  siteBase = "/",
): QuarterlyRepository {
  const root = apiBase.replace(/\/$/, "");
  const media: MediaContext = { apiBase: root, siteBase };

  return {
    async list(): Promise<QuarterlyList> {
      if (!root) return emptyList;
      const body = await $fetch<QuarterlyList | Quarterly[]>(`${root}/quarterlies`);
      const items = (Array.isArray(body) ? body : asPage<Quarterly>(body).items).map(
        (item, index) => ({
          ...rewriteMediaTree(item, media),
          tone: (item.tone ?? index % 3) as 0 | 1 | 2,
        }),
      );
      return { items };
    },
  };
}
