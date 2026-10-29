import type { NuxtApp } from "#app";
import type { NewsList, NewsSummary } from "~/data/news/types";
import { createApiAwardRepository } from "~/data/singletons/api";
import type { SiteContent } from "~/types/content";

interface AwardBlock {
  type: string;
  text?: string;
}

interface AwardFile {
  title: string;
  blocks: AwardBlock[];
  bodyHtmlVerbatim: string;
}

export interface AwardDocument {
  title: string;
  lead: string;
}

function cached<T>(key: string, nuxtApp: NuxtApp): T | undefined {
  if (!nuxtApp.isHydrating) return undefined;
  return nuxtApp.payload.data[key] as T | undefined;
}

export async function useAwardPage() {
  const route = useRoute();
  const repo = useNewsRepository();
  const siteState = useSite();
  const baseURL = useRuntimeConfig().app.baseURL;
  const page = pageNumber(route.params.page);
  const order = ref<"asc" | "desc">(route.query.order === "asc" ? "asc" : "desc");
  const list = ref<NewsList | null>(null);
  const featured = ref<NewsSummary | null>(null);

  const documentState = useAsyncData(
    "award-document",
    async () => {
      const file = (await createApiAwardRepository(
        useContentApiBase(),
        baseURL,
      ).get()) as AwardFile | null;
      if (!file) return null;
      const blocks = Array.isArray(file.blocks) ? file.blocks : [];
      const lead =
        blocks.find((block) => block.type === "paragraph")?.text ??
        (typeof (file as unknown as { lead?: unknown }).lead === "string"
          ? (file as unknown as { lead: string }).lead
          : "");
      return { title: file.title, lead } satisfies AwardDocument;
    },
    { getCachedData: cached },
  );
  const listState = useNewsList({
    page: page ?? 1,
    topic: "award",
    order,
    skip: 1,
  });
  const featuredState = useAsyncData(
    () => `award-featured-${order.value}`,
    () => repo.list({ page: 1, perPage: 1, topic: "award", order: order.value }),
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
  const documentData = await documentState;
  const { data } = await listState;
  const featuredData = await featuredState;
  const pages = data.value?.pages ?? 0;
  if (!site || !documentData.data.value) {
    throw createError({
      statusCode: site ? 404 : 500,
      statusMessage: site?.ui.notFound ?? "محتوای سایت پیدا نشد",
    });
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
    document: documentData.data.value,
    list: list as Ref<NewsList>,
    featured,
  });
}
