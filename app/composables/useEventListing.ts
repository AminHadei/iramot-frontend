import type { ListingView } from "~/composables/useArchiveListing";
import type { SiteContent } from "~/types/content";
import type { ListingCard } from "~/utils/archive";

function eventPath(base: string, page: number) {
  if (page <= 1) return base;
  return `${base}/page/${page}`;
}

export async function useEventListing(): Promise<ListingView> {
  const route = useRoute();
  const page = pageNumber(route.params.page);
  const siteState = useSite();
  const path = route.path.replace(/\/page\/\d+$/, "").replace(/\/$/, "") || "/events";
  const listing = useAsyncData(`events-${path}-${page}`, async () => {
    if (page === null) return null;
    const site = (await siteState).data.value as SiteContent | null;
    if (!site) return null;
    const filter = site.eventFilters.find((entry) => entry.to === path);
    const isAll = path === "/events";
    if (!isAll && !filter) return null;

    const [postsFile, eventsFile] = await Promise.all([
      queryCollection("archivePosts").first(),
      queryCollection("archiveEvents").first(),
    ]);
    const posts = archiveItems(postsFile);
    const events = archiveItems(eventsFile);
    const eventCard = (item: (typeof events)[number]): ListingCard =>
      toCard(item, {
        html: articleHtml(item.content ?? "").html.trim() || undefined,
      });

    let items: ListingCard[];
    if (isAll || !filter) {
      items = byDateDesc(events).map(eventCard);
    } else {
      const ids = new Set(filter.eventIds);
      const postCards = byDateDesc(
        posts.filter((item) =>
          (item.categories ?? []).some((entry) => entry.slug === filter.posts),
        ),
      ).map((item) => {
        const publication = itemInSet(item, site.sets.publications);
        const external = externalHref(item.content ?? "");
        const body = !publication ? articleHtml(item.content ?? "").html.trim() : "";
        return toCard(item, {
          external,
          to: external || !publication ? undefined : researchPath(item.slug),
          html: body || undefined,
        });
      });
      const eventCards = byDateDesc(events.filter((item) => ids.has(item.id))).map(
        eventCard,
      );
      items = [...postCards, ...eventCards];
    }

    const paged = slicePage(items, page);
    if (page > paged.pages) return null;

    return {
      title: isAll || !filter ? site.listings.events.title : filter.label,
      description: site.listings.events.description,
      filters: [
        { label: site.ui.all, to: "/events", current: isAll },
        ...site.eventFilters.map((entry) => ({
          label: entry.label,
          to: entry.to,
          current: entry.to === path,
        })),
      ],
      cards: paged.items,
      previous: page > 1 ? eventPath(path, page - 1) : undefined,
      next: page < paged.pages ? eventPath(path, page + 1) : undefined,
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
