import type { EventProgram } from "~/data/events/programs";

export type { EventProgram };

export type EventMode = "in-person" | "online";

export type EventSpeakerRole = "expert" | "presenter" | "lead" | "instructor";

export interface EventSpeaker {
  name: string;
  role: EventSpeakerRole;
}

export interface EventSummary {
  id: number;
  slug: string;
  program: EventProgram;
  title: string;
  excerpt: string;
  startsAt?: string;
  dateText?: string;
  poster?: string;
}

export interface EventArticle extends EventSummary {
  location?: string;
  mode?: EventMode[];
  speakers?: EventSpeaker[];
  registrationUrl?: string;
  videoUrl?: string;
  bodyHtml: string;
  related: EventSummary[];
}

export interface EventRecord extends EventSummary {
  publishedAt?: string;
  location?: string;
  mode?: EventMode[];
  speakers?: EventSpeaker[];
  registrationUrl?: string;
  videoUrl?: string;
  bodyHtml: string;
  canonicalOf?: number;
}

export interface EventIndexFile {
  programs: Array<{ slug: EventProgram }>;
  items: EventRecord[];
}

export interface EventListQuery {
  program?: EventProgram;
  page: number;
  perPage: number;
  order?: "asc" | "desc";
  omitFeatured?: boolean;
}

export interface EventList {
  items: EventSummary[];
  total: number;
  pages: number;
}

export interface EventRepository {
  list(query: EventListQuery): Promise<EventList>;
  featured(program?: EventProgram): Promise<EventSummary | null>;
  get(slug: string): Promise<EventArticle | null>;
}
