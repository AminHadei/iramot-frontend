import type { ArchiveItem } from "~/types/content";
import { useMediaRewriteBase } from "~/composables/useContentApiBase";
import { fetchJsonOrNull } from "~/data/fetchJson";
import { articleHtml } from "~/utils/articleHtml";
import { rewriteStorageHtml } from "~/utils/mediaUrl";

export interface PageRepository {
  get(id: number): Promise<ArchiveItem | null>;
}

export function createApiPageRepository(
  apiBase: string,
  siteBase = "/",
): PageRepository {
  const root = apiBase.replace(/\/$/, "");
  const mediaRoot = useMediaRewriteBase(root);
  return {
    async get(id: number) {
      if (!root) return null;
      const record = await fetchJsonOrNull<ArchiveItem>(`${root}/pages/by-id/${id}`);
      if (!record) return null;
      return {
        ...record,
        content: record.content
          ? articleHtml(
              rewriteStorageHtml(record.content, mediaRoot),
              siteBase,
              undefined,
              mediaRoot,
            ).html
          : record.content,
      };
    },
  };
}
