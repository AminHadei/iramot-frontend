import type { EventProgram } from "~/data/events/programs";
import type {
  EventArticle,
  EventList,
  EventListQuery,
  EventRepository,
  EventSummary,
} from "~/data/events/types";
import { articleHtml } from "~/utils/articleHtml";

const emptyList: EventList = { items: [], total: 0, pages: 0 };

export function createApiEventRepository(apiBase: string): EventRepository {
  const root = apiBase.replace(/\/$/, "");

  return {
    async list(query: EventListQuery): Promise<EventList> {
      if (!root) return emptyList;
      return $fetch<EventList>(`${root}/events`, { query });
    },
    async featured(program?: EventProgram): Promise<EventSummary | null> {
      if (!root) return null;
      return $fetch<EventSummary | null>(`${root}/events/featured`, {
        query: { program },
      });
    },
    async get(slug: string): Promise<EventArticle | null> {
      if (!root) return null;
      const event = await $fetch<EventArticle>(
        `${root}/events/${encodeURIComponent(slug)}`,
      );
      const prepared = articleHtml(event.bodyHtml || "");
      return { ...event, bodyHtml: prepared.html };
    },
  };
}
