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
  latestLabel: string;
  sortLabel: string;
  dateDescending: string;
  dateAscending: string;
  authorLabel: string;
  order: "asc" | "desc";
}

export type ListingGroup =
  "publications" | "opportunities" | "conference" | "quarterlies" | "award";

const listingBase: Record<ListingGroup, string> = {
  publications: "/news",
  opportunities: "/opportunities",
  conference: "/conference",
  quarterlies: "/quarterlies",
  award: "/award",
};

function pageIdFor(site: SiteContent, group: ListingGroup): number | null {
  if (group === "opportunities") return site.pages.opportunities;
  if (group === "conference") return site.pages.conference;
  if (group === "award") return site.pages.award;
  return null;
}

export async function useArchiveListing(group: ListingGroup): Promise<ListingView> {
  const route = useRoute();
  const baseURL = useRuntimeConfig().app.baseURL;
  const category = oneParam(route.params.slug);
  const page = pageNumber(route.params.page);
  const order = computed(() => {
    const queryOrder = route.query.order;
    return (Array.isArray(queryOrder) ? queryOrder[0] : queryOrder) === "asc"
      ? "asc"
      : "desc";
  });
  const siteState = useSite();
  const base = listingBase[group];
  const withOrder = (path: string) =>
    order.value === "asc" ? `${path}?order=asc` : path;
  const listing = useAsyncData(
    () => `listing-${group}-${category}-${page}-${order.value}`,
    async () => {
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
      const ordered =
        order.value === "asc"
          ? [...selected].sort((left, right) => left.date.localeCompare(right.date))
          : byDateDesc(selected);
      const paged = slicePage(ordered, page);
      if (page > paged.pages) return null;

      const filters = [
        {
          label: site.ui.all,
          to: withOrder(listingPath(base, 1)),
          current: !category,
        },
        ...listFilters(inGroup, set).map((entry) => ({
          label: entry.name,
          to: withOrder(listingPath(base, 1, entry.slug)),
          current: entry.slug === category,
        })),
      ];

      let title = site.listings.research.title;
      let description = site.listings.research.description;
      const pageId = pageIdFor(site, group);
      if (pageId !== null) {
        const record = archiveItems(await queryCollection("archivePages").first()).find(
          (item) => item.id === pageId,
        );
        if (!record) return null;
        title = record.title;
        description =
          group === "award"
            ? plainText(record.excerpt || record.title)
            : site.ui.emptyBody;
      } else if (group === "quarterlies") {
        title = site.listings.quarterlies.title;
        description = site.listings.quarterlies.description;
      }
      const current = filters.find(
        (filter) => filter.current && filter.to !== listingPath(base, 1),
      );
      if (current) title = current.label;

      const showBody = group !== "publications";
      const cards = paged.items.map((item) => {
        const publication = itemInSet(item, site.sets.publications);
        const external = showBody ? externalHref(item.content ?? "") : undefined;
        const body =
          showBody && !publication
            ? articleHtml(item.content ?? "", baseURL).html.trim()
            : "";
        return toCard(item, {
          external,
          to: external || !publication ? undefined : researchPath(item.slug),
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
          page > 1
            ? withOrder(listingPath(base, page - 1, category || undefined))
            : undefined,
        next:
          page < paged.pages
            ? withOrder(listingPath(base, page + 1, category || undefined))
            : undefined,
        previousLabel: site.ui.previous,
        nextLabel: site.ui.next,
        latestLabel: site.ui.latest,
        sortLabel: site.ui.sort,
        dateDescending: site.ui.dateDescending,
        dateAscending: site.ui.dateAscending,
        authorLabel: site.ui.author,
        order: order.value,
      } satisfies ListingView;
    },
  );

  const site = (await siteState).data.value as SiteContent | null;
  if (!site) {
    throw createError({ statusCode: 500, statusMessage: "محتوای سایت پیدا نشد" });
  }
  const { data } = await listing;
  if (page === null || !data.value) {
    throw createError({ statusCode: 404, statusMessage: site.ui.notFound });
  }
  const view = reactive({ ...data.value });
  watch(data, (value) => {
    if (value) Object.assign(view, value);
  });
  return view;
}
