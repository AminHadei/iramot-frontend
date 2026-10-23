import type { NuxtApp } from "#app";
import { newsPageSize } from "~/data/news/types";
import type { NewsList, NewsSummary } from "~/data/news/types";
import type { SiteContent } from "~/types/content";

function payloadDuringHydration(key: string, nuxtApp: NuxtApp): NewsList | undefined {
  if (!nuxtApp.isHydrating) return undefined;
  return nuxtApp.payload.data[key] as NewsList | undefined;
}

export function useNewsList(input: {
  page: number;
  category?: string;
  topic?: string;
  order: Ref<"asc" | "desc">;
  skip?: number;
}) {
  const repo = useNewsRepository();
  return useAsyncData(
    () =>
      `news-list-${input.topic ?? "any"}-${input.category ?? "all"}-${input.order.value}-${input.page}-s${input.skip ?? 0}`,
    () =>
      repo.list({
        page: input.page,
        perPage: newsPageSize,
        category: input.category,
        topic: input.topic,
        order: input.order.value,
        skip: input.skip,
      }),
    {
      watch: [input.order],
      getCachedData: payloadDuringHydration,
    },
  );
}

export async function useNewsArchive() {
  const route = useRoute();
  const repo = useNewsRepository();
  const siteState = useSite();
  const page = pageNumber(route.params.page);
  const category = route.path.includes("/news/category/")
    ? oneParam(route.params.slug)
    : undefined;
  const order = ref<"asc" | "desc">(route.query.order === "asc" ? "asc" : "desc");
  const list = ref<NewsList | null>(null);
  const featured = ref<NewsSummary | null>(null);
  const listState = useNewsList({ page: page ?? 1, category, order, skip: 1 });
  const featuredState = useAsyncData(
    () => `news-featured-${category ?? "all"}-${order.value}`,
    () => repo.list({ page: 1, perPage: 1, category, order: order.value }),
    {
      watch: [order],
      getCachedData: payloadDuringHydration,
    },
  );

  watch(listState.data, (value) => {
    if (value) list.value = value;
  });
  watch(featuredState.data, (value) => {
    featured.value = value?.items[0] ?? null;
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
  const filters = await repo.categories();
  const known = !category || filters.some((filter) => filter.slug === category);
  const pages = data.value?.pages ?? 0;
  if (!site || page === null || !data.value || !known || (page > 1 && page > pages)) {
    throw createError({ statusCode: 404, statusMessage: site?.ui.notFound });
  }

  const current = filters.find((filter) => filter.slug === category);
  list.value = data.value;
  featured.value = featuredData.data.value?.items[0] ?? null;
  const state = reactive({
    title: current?.name ?? site.listings.research.title,
    description: site.listings.research.description,
    site,
    page,
    category,
    order,
    list: list as Ref<NewsList>,
    featured,
    filters,
  });

  return state;
}
