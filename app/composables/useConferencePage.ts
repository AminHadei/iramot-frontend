import type { NuxtApp } from "#app";
import type { NewsList, NewsSummary } from "~/data/news/types";
import type { SiteContent } from "~/types/content";

function cached<T>(key: string, nuxtApp: NuxtApp): T | undefined {
  if (!nuxtApp.isHydrating) return undefined;
  return nuxtApp.payload.data[key] as T | undefined;
}

export async function useConferencePage() {
  const route = useRoute();
  const repo = useNewsRepository();
  const siteState = useSite();
  const page = pageNumber(route.params.page);
  const order = ref<"asc" | "desc">(route.query.order === "asc" ? "asc" : "desc");
  const list = ref<NewsList | null>(null);
  const featured = ref<NewsSummary | null>(null);

  const listState = useNewsList({
    page: page ?? 1,
    category: "conference-news",
    order,
    skip: 1,
  });
  const featuredState = useAsyncData(
    () => `conference-featured-${order.value}`,
    () =>
      repo.list({
        page: 1,
        perPage: 1,
        category: "conference-news",
        order: order.value,
      }),
    { watch: [order], getCachedData: cached },
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

  const site = (await siteState).data.value as SiteContent | null;
  const { data } = await listState;
  const featuredData = await featuredState;
  const pages = data.value?.pages ?? 0;
  if (!site) {
    throw createError({ statusCode: 500, statusMessage: "محتوای سایت پیدا نشد" });
  }
  if (page === null || !data.value || (page > 1 && page > pages)) {
    throw createError({ statusCode: 404, statusMessage: site.ui.notFound });
  }

  list.value = data.value;
  featured.value = featuredData.data.value?.items[0] ?? null;

  return reactive({
    site,
    page,
    order,
    intro: site.conference.intro,
    list: list as Ref<NewsList>,
    featured,
  });
}
