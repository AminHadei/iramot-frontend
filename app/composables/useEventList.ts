import type { NuxtApp } from "#app";
import {
  eventListingPath,
  eventPageSize,
  isEventProgram,
} from "~/data/events/programs";
import type { EventProgram } from "~/data/events/programs";
import type { EventList, EventSummary } from "~/data/events/types";
import type { SiteContent } from "~/types/content";

function payloadDuringHydration(key: string, nuxtApp: NuxtApp): EventList | undefined {
  if (!nuxtApp.isHydrating) return undefined;
  return nuxtApp.payload.data[key] as EventList | undefined;
}

export function useEventList(input: {
  program?: EventProgram;
  page: number;
  order: Ref<"asc" | "desc">;
}) {
  const repo = useEventRepository();
  return useAsyncData(
    () => `event-list-${input.program ?? "all"}-${input.order.value}-${input.page}`,
    () =>
      repo.list({
        program: input.program,
        page: input.page,
        perPage: eventPageSize,
        order: input.order.value,
        omitFeatured: true,
      }),
    {
      watch: [input.order],
      getCachedData: payloadDuringHydration,
    },
  );
}

export async function useEventArchive() {
  const route = useRoute();
  const repo = useEventRepository();
  const siteState = useSite();
  const page = pageNumber(route.params.page);
  const segment = route.path.split("/").filter(Boolean)[1] ?? "";
  const program = isEventProgram(segment) ? segment : undefined;
  const order = ref<"asc" | "desc">(route.query.order === "asc" ? "asc" : "desc");
  const list = ref<EventList | null>(null);
  const featured = ref<EventSummary | null>(null);
  const listState = useEventList({ program, page: page ?? 1, order });
  const featuredState = useAsyncData(
    () => `event-featured-${program ?? "all"}`,
    () => repo.featured(program),
    {
      getCachedData(key, nuxtApp) {
        if (!nuxtApp.isHydrating) return undefined;
        return nuxtApp.payload.data[key] as EventSummary | null | undefined;
      },
    },
  );

  watch(listState.data, (value) => {
    if (value) list.value = value;
  });
  watch(featuredState.data, (value) => {
    featured.value = value ?? null;
  });
  watch(
    () => route.query.order,
    (value) => {
      order.value = value === "asc" ? "asc" : "desc";
    },
  );

  const siteData = await siteState;
  const site = siteData.data.value as SiteContent | null;
  const { data } = await listState;
  const featuredData = await featuredState;
  const pages = data.value?.pages ?? 0;
  const known = !segment || segment === "page" || program !== undefined;
  if (!site || page === null || !data.value || !known || (page > 1 && page > pages)) {
    throw createError({ statusCode: 404, statusMessage: site?.ui.notFound });
  }

  const current = site.eventFilters.find(
    (filter) => filter.to === `/events/${program}`,
  );
  list.value = data.value;
  featured.value = featuredData.data.value ?? null;
  return reactive({
    title: current?.label ?? site.listings.events.title,
    description: site.listings.events.description,
    site,
    page,
    program,
    order,
    list: list as Ref<EventList>,
    featured,
    filters: site.eventFilters,
  });
}

export { eventListingPath };
