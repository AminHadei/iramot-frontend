<script setup lang="ts">
import type { HomeContent, SiteContent } from "~/types/content";
import type { ListingCard } from "~/utils/archive";

const { data: siteData } = await useSite();
if (!siteData.value) {
  throw createError({ statusCode: 500, statusMessage: "محتوای خانه پیدا نشد" });
}
const site = siteData.value as SiteContent;

const { data: home } = await useAsyncData("home-page", async () => {
  const [pageFile, postsFile, eventsFile, termsFile] = await Promise.all([
    queryCollection("home").first(),
    queryCollection("archivePosts").first(),
    queryCollection("archiveEvents").first(),
    queryCollection("archiveTerms").first(),
  ]);
  if (!pageFile) return null;
  const page = pageFile as HomeContent;
  const posts = archiveItems(postsFile);
  const events = archiveItems(eventsFile);
  const publications = byDateDesc(
    posts.filter((item) => itemInSet(item, site.sets.publications)),
  );
  const event = nextOrLatest(events);
  const conference = byDateDesc(
    posts.filter((item) => itemInSet(item, site.sets.conference)),
  )[0];

  const publicationCards = publications.slice(0, 6).map((item) =>
    toCard(item, {
      to: researchPath(item.slug),
      category: categoryName(item, site.sets.publications),
    }),
  );
  const workgroupCards = byDateDesc(
    posts.filter((item) => itemInSet(item, site.sets.workgroups)),
  ).map((item) =>
    toCard(item, {
      to: itemInSet(item, site.sets.publications) ? researchPath(item.slug) : undefined,
      category: categoryName(item, site.sets.workgroups),
    }),
  );
  const eventCards = byDateDesc(events)
    .slice(0, 4)
    .map((item) => toCard(item));
  const quarterlyCards = byDateDesc(
    posts.filter((item) => itemInSet(item, site.sets.quarterlies)),
  ).map((item) => {
    const external = externalHref(item.content ?? "");
    const linked = itemInSet(item, site.sets.publications);
    return toCard(item, {
      external,
      to: external || !linked ? undefined : researchPath(item.slug),
      category: categoryName(item, site.sets.quarterlies),
    });
  });

  const cells: Array<{ label: string; title: string; date?: string; to?: string }> = [];
  if (event) {
    cells.push({
      label: page.strip.event,
      title: event.title,
      date: event.date,
      to: "/events",
    });
  }
  if (conference) {
    cells.push({
      label: page.strip.conference,
      title: conference.title,
      date: conference.date,
      to: "/conference",
    });
  }
  cells.push({
    label: page.strip.membership,
    title: site.membership.label,
    to: site.membership.to,
  });

  return {
    page,
    cells,
    publications: publicationCards satisfies ListingCard[],
    workgroups: workgroupCards,
    events: eventCards,
    terms: archiveItems(termsFile)
      .map((item) => item.title)
      .filter((title) => title.length > 0)
      .sort((left, right) => left.localeCompare(right, "fa")),
    quarterlies: quarterlyCards,
  };
});

if (!home.value?.page) {
  throw createError({ statusCode: 500, statusMessage: "محتوای خانه پیدا نشد" });
}

const view = home.value;
const page = view.page;

usePageSeo({
  title: page.title,
  description: page.dek,
});
</script>

<template>
  <div>
    <HomeSplash :title="page.title" :links="page.links" />
    <HomeStrip :cells="view.cells" />
    <section class="border-t border-line">
      <div class="page-inset py-16">
        <SectionHeading
          :title="page.sections.publications"
          to="/research"
          :link-label="page.publicationsLink"
        />
        <div class="mt-8 grid gap-5 wide:grid-cols-3">
          <PostListing
            v-for="card in view.publications"
            :key="card.id"
            :title="card.title"
            :to="card.to"
            :excerpt="card.excerpt"
            :category="card.category"
            :date="card.date"
            :image="card.image"
          />
        </div>
      </div>
    </section>
    <section class="border-t border-line">
      <div class="page-inset py-16">
        <SectionHeading
          :title="page.sections.workgroups"
          to="/workgroups"
          :link-label="page.sectionLinks.workgroups"
        />
        <div class="mt-8 grid gap-5 wide:grid-cols-3">
          <PostListing
            v-for="card in view.workgroups"
            :key="card.id"
            :title="card.title"
            :to="card.to"
            :excerpt="card.excerpt"
            :category="card.category"
            :date="card.date"
            :image="card.image"
          />
        </div>
      </div>
    </section>
    <section class="border-t border-line">
      <div class="page-inset py-16">
        <SectionHeading
          :title="page.sections.events"
          to="/events"
          :link-label="page.sectionLinks.events"
        />
        <div class="mt-8 grid gap-5 wide:grid-cols-2">
          <PostListing
            v-for="card in view.events"
            :key="card.id"
            :title="card.title"
            :excerpt="card.excerpt"
            :date="card.date"
            :image="card.image"
          />
        </div>
      </div>
    </section>
    <section class="border-t border-line">
      <div class="page-inset py-16">
        <SectionHeading
          :title="page.sections.terms"
          to="/terminology"
          :link-label="page.sectionLinks.terms"
        />
        <TermSearch
          class="mt-8"
          :terms="view.terms"
          :label="page.search.label"
          :empty-label="page.search.empty"
        />
      </div>
    </section>
    <section class="border-t border-line">
      <div class="page-inset py-16">
        <SectionHeading
          :title="page.sections.quarterlies"
          to="/quarterlies"
          :link-label="page.sectionLinks.quarterlies"
        />
        <div class="mt-8 grid gap-5 wide:grid-cols-3">
          <PostListing
            v-for="card in view.quarterlies"
            :key="card.id"
            :title="card.title"
            :to="card.to"
            :external="card.external"
            :excerpt="card.excerpt"
            :category="card.category"
            :date="card.date"
            :image="card.image"
          />
        </div>
      </div>
    </section>
    <section class="border-t border-line">
      <div class="page-inset py-16">
        <SectionHeading
          :title="page.sections.partners"
          to="/partners"
          :link-label="page.sectionLinks.partners"
        />
        <PersonCard class="mt-8 max-w-sm" :empty-label="page.partnersEmpty" />
      </div>
    </section>
    <section class="border-t border-line">
      <div class="page-inset py-16">
        <SectionHeading :title="page.sections.newsletter" />
        <NewsletterForm
          class="mt-8"
          :label="page.newsletter.label"
          :submit="page.newsletter.submit"
          :note="page.newsletter.note"
        />
      </div>
    </section>
  </div>
</template>
