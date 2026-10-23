import type { SiteContent } from "~/types/content";

export async function useOpportunityPage() {
  const route = useRoute();
  const siteState = useSite();
  const listState = useOpportunityList();
  const page = pageNumber(route.params.page);
  const site = (await siteState).data.value as SiteContent | null;
  const { data } = await listState;
  if (!site) {
    throw createError({ statusCode: 500, statusMessage: "محتوای سایت پیدا نشد" });
  }
  const paged = page === null || !data.value ? null : slicePage(data.value.items, page);
  const pages = paged?.pages ?? 0;
  if (page === null || !data.value || !paged || (page > 1 && page > pages)) {
    throw createError({ statusCode: 404, statusMessage: site.ui.notFound });
  }

  return {
    title: site.listings.opportunities.title,
    items: paged.items,
    page,
    pages,
    site,
  };
}
