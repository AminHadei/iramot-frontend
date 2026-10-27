import type { EventProgram } from "~/data/events/programs";
import type {
  EventArticle,
  EventList,
  EventListQuery,
  EventRepository,
  EventSummary,
} from "~/data/events/types";
import { fetchJsonOrNull } from "~/data/fetchJson";
import { isNotFoundError } from "~/utils/httpStatus";
import { articleHtml } from "~/utils/articleHtml";
import {
  rewriteMediaTree,
  rewriteStorageHtml,
  type MediaContext,
} from "~/utils/mediaUrl";

const emptyList: EventList = { items: [], total: 0, pages: 0 };

export function createApiEventRepository(
  apiBase: string,
  siteBase = "/",
): EventRepository {
  const root = apiBase.replace(/\/$/, "");
  const media: MediaContext = { apiBase: root, siteBase };

  function mapSummary<T extends EventSummary>(item: T): T {
    return rewriteMediaTree(item, media);
  }

  return {
    async list(query: EventListQuery): Promise<EventList> {
      if (!root) return emptyList;
      const data = await $fetch<EventList>(`${root}/events`, { query });
      return { ...data, items: (data.items ?? []).map((item) => mapSummary(item)) };
    },
    async featured(program?: EventProgram): Promise<EventSummary | null> {
      if (!root) return null;
      try {
        const body = await $fetch<EventSummary | null>(`${root}/events/featured`, {
          query: { program },
        });
        if (body == null) return null;
        return mapSummary(body);
      } catch (error) {
        if (isNotFoundError(error)) return null;
        throw error;
      }
    },
    async get(slug: string): Promise<EventArticle | null> {
      if (!root) return null;
      const event = await fetchJsonOrNull<EventArticle>(
        `${root}/events/${encodeURIComponent(slug)}`,
      );
      if (!event) return null;
      const prepared = articleHtml(
        rewriteStorageHtml(event.bodyHtml || "", root),
        siteBase,
      );
      return { ...mapSummary(event), bodyHtml: prepared.html };
    },
  };
}
