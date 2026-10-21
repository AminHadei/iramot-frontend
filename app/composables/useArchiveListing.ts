import type { SiteContent } from "~/types/content";
import type { ListingCard } from "~/utils/archive";

export interface ListingView {
  title: string;
  description: string;
  filters: Array<{ label: string; to: string; current: boolean }>;
  cards: ListingCard[];
  previous?: string;
  next?: string;
  previousLabel: string;
  nextLabel: string;
}

export async function useArchiveListing(
  group: "publications" | "opportunities",
): Promise<ListingView> {
  const route = useRoute();
  const category = oneParam(route.params.slug);
  const page = pageNumber(route.params.page);
  const siteState = useSite();
  const base = group === "publications" ? "/research" : "/opportunities";
  const listing = useAsyncData(`listing-${group}-${category}-${page}`, async () => {
    if (page === null) return null;
    const site = (await siteState).data.value as SiteContent | null;
    if (!site) return null;
    const postsFile = await queryCollection("archivePosts").first();
    const posts = archiveItems(postsFile);
    const set = site.sets[group];
    if (category && !categoryInSet(category, set)) return null;

    const inGroup = posts.filter((item) => itemInSet(item, set));
    const selected = category
      ? inGroup.filter((item) =>
          (item.categories ?? []).some((entry) => entry.slug === category),
        )
      : inGroup;
    const paged = slicePage(byDateDesc(selected), page);
    if (page > paged.pages) return null;

    const filters = [
      {
        label: site.ui.all,
        to: listingPath(base, 1),
        current: !category,
      },
      ...listFilters(inGroup, set).map((entry) => ({
        label: entry.name,
        to: listingPath(base, 1, entry.slug),
        current: entry.slug === category,
      })),
    ];

    let title = site.listings.research.title;
    let description = site.listings.research.description;
    if (group === "opportunities") {
      const pagesFile = await queryCollection("archivePages").first();
      const record = archiveItems(pagesFile).find(
        (item) => item.id === site.pages.opportunities,
      );
      if (!record) return null;
      title = record.title;
      description = site.ui.emptyBody;
    }
    const current = filters.find(
      (filter) => filter.current && filter.to !== listingPath(base, 1),
    );
    if (current) title = current.label;

    const cards = paged.items.map((item) => {
      const publication = itemInSet(item, site.sets.publications);
      const body =
        group === "opportunities" && !publication
          ? articleHtml(item.content ?? "").html.trim()
          : "";
      return toCard(item, {
        to: publication ? researchPath(item.slug) : undefined,
        category: categoryName(item, set),
        html: body || undefined,
      });
    });

    return {
      title,
      description,
      filters,
      cards,
      previous:
        page > 1 ? listingPath(base, page - 1, category || undefined) : undefined,
      next:
        page < paged.pages
          ? listingPath(base, page + 1, category || undefined)
          : undefined,
      previousLabel: site.ui.previous,
      nextLabel: site.ui.next,
    } satisfies ListingView;
  });

  const site = (await siteState).data.value as SiteContent | null;
  if (!site) {
    throw createError({ statusCode: 500, statusMessage: "محتوای سایت پیدا نشد" });
  }
  const { data } = await listing;
  if (page === null || !data.value) {
    throw createError({ statusCode: 404, statusMessage: site.ui.notFound });
  }
  return data.value;
}
