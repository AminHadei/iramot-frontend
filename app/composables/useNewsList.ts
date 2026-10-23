import { newsPageSize } from "~/data/news/types";
import type { NewsList } from "~/data/news/types";
import type { SiteContent } from "~/types/content";

export function useNewsList(input: {
  page: number;
  category?: string;
  order: Ref<"asc" | "desc">;
}) {
  const repo = useNewsRepository();
  return useAsyncData(
    `news-list-${input.category ?? "all"}-${input.page}`,
    () =>
      repo.list({
        page: input.page,
        perPage: newsPageSize,
        category: input.category,
        order: input.order.value,
      }),
    { watch: [input.order] },
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
  const order = ref<"asc" | "desc">("desc");
  const list = ref<NewsList | null>(null);
  const listState = useNewsList({ page: page ?? 1, category, order });

  watch(listState.data, (value) => {
    if (value) list.value = value;
  });
  onMounted(() => {
    if (route.query.order === "asc") order.value = "asc";
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
  const filters = await repo.categories();
  const known = !category || filters.some((filter) => filter.slug === category);
  const pages = data.value?.pages ?? 0;
  if (!site || page === null || !data.value || !known || (page > 1 && page > pages)) {
    throw createError({ statusCode: 404, statusMessage: site?.ui.notFound });
  }

  const current = filters.find((filter) => filter.slug === category);
  list.value = data.value;
  const state = reactive({
    title: current?.name ?? site.listings.research.title,
    description: site.listings.research.description,
    site,
    page,
    category,
    order,
    list: list as Ref<NewsList>,
    filters,
  });

  return state;
}
