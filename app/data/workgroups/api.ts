import type {
  WorkgroupArticle,
  WorkgroupFile,
  WorkgroupList,
  WorkgroupRepository,
} from "~/data/workgroups/types";
import { fetchJsonOrNull } from "~/data/fetchJson";
import {
  articleFromWorkgroupFile,
  listFromWorkgroupFile,
} from "~/data/workgroups/present";
import { rewriteMediaTree, type MediaContext } from "~/utils/mediaUrl";

function isFile(value: unknown): value is WorkgroupFile {
  if (!value || typeof value !== "object") return false;
  const record = value as { section?: unknown; groups?: unknown };
  return Boolean(record.section) && Array.isArray(record.groups);
}

export function createApiWorkgroupRepository(
  apiBase: string,
  siteBase = "/",
): WorkgroupRepository {
  const root = apiBase.replace(/\/$/, "");
  const media: MediaContext = { apiBase: root, siteBase };

  return {
    async list(): Promise<WorkgroupList> {
      if (!root) return { title: "", description: "", groups: [] };
      const body = await fetchJsonOrNull<WorkgroupList | WorkgroupFile>(
        `${root}/workgroups`,
      );
      if (!body) return { title: "", description: "", groups: [] };
      if (isFile(body))
        return listFromWorkgroupFile(rewriteMediaTree(body, media), siteBase);
      return rewriteMediaTree(body, media);
    },
    async get(slug: string): Promise<WorkgroupArticle | null> {
      if (!root) return null;
      const direct = await fetchJsonOrNull<WorkgroupArticle | WorkgroupFile>(
        `${root}/workgroups/${encodeURIComponent(slug)}`,
      );
      if (!direct) return null;
      if (isFile(direct)) {
        return articleFromWorkgroupFile(
          rewriteMediaTree(direct, media),
          slug,
          siteBase,
        );
      }
      if ("groups" in direct && Array.isArray(direct.groups)) {
        return articleFromWorkgroupFile(
          direct as unknown as WorkgroupFile,
          slug,
          siteBase,
        );
      }
      return rewriteMediaTree(direct, media);
    },
  };
}
