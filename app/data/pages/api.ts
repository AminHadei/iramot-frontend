import type { ArchiveItem } from "~/types/content";
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
  return {
    async get(id: number) {
      if (!root) return null;
      const record = await fetchJsonOrNull<ArchiveItem>(`${root}/pages/by-id/${id}`);
      if (!record) return null;
      return {
        ...record,
        content: record.content
          ? articleHtml(rewriteStorageHtml(record.content, root), siteBase).html
          : record.content,
      };
    },
  };
}
