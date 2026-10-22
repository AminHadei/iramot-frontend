<script setup lang="ts">
import type { ArchiveItem, HomeContent, SiteContent } from "~/types/content";
import type { ListingCard } from "~/utils/archive";

interface AboutFields {
  description?: string;
  lead?: string;
}

interface HomeCard extends ListingCard {
  colorIndex: number;
}

interface ProgramCard {
  title: string;
  description: string;
  to: string;
}

const { data: siteData } = await useSite();
if (!siteData.value) {
  throw createError({ statusCode: 500, statusMessage: "محتوای خانه پیدا نشد" });
}
const site = siteData.value as SiteContent;

function firstSentence(value: string) {
  const text = plainText(value);
  const match = text.match(/^.*?[.؟!]/);
  return match?.[0] ?? text;
}

function accentStyle(index: number): Record<string, string> {
  const slot = (index % 4) + 1;
  return { "--color-accent": `var(--color-category-${slot})` };
}

function withColor(cards: ListingCard[]): HomeCard[] {
  const seen: string[] = [];
  return cards.map((card) => {
    const name = card.category ?? "";
    let colorIndex = seen.indexOf(name);
    if (colorIndex < 0) {
      seen.push(name);
      colorIndex = seen.length - 1;
    }
    return { ...card, colorIndex };
  });
}

function listedEvents(items: ArchiveItem[]) {
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = items
    .filter((item) => item.date.slice(0, 10) >= today)
    .sort((left, right) => left.date.localeCompare(right.date));
  return upcoming.length ? upcoming : byDateDesc(items);
}

const { data: home } = await useAsyncData("home-page", async () => {
  const [pageFile, aboutFile, postsFile, eventsFile, pagesFile] = await Promise.all([
    queryCollection("home").first(),
    queryCollection("pages").path("/about").first(),
    queryCollection("archivePosts").first(),
    queryCollection("archiveEvents").first(),
    queryCollection("archivePages").first(),
  ]);
  if (!pageFile || !aboutFile) return null;
  const page = pageFile as HomeContent;
  const about = aboutFile as AboutFields;
  const posts = archiveItems(postsFile);
  const pages = archiveItems(pagesFile);
  const publicationCards = withColor(
    byDateDesc(posts.filter((item) => itemInSet(item, site.sets.latest)))
      .slice(0, 12)
      .map((item) =>
        toCard(item, {
          to: researchPath(item.slug),
          category: categoryName(item, site.sets.latest),
        }),
      ),
  );
  const spotlightPosts = page.spotlight.posts.map((post) => {
    const group = page.spotlight.groups.find((entry) => entry.title === post.category);
    return {
      id: post.id,
      title: post.title,
      excerpt: post.excerpt,
      date: post.date,
      category: post.category,
      image: post.image,
      external: post.href,
      colorIndex: (group?.color ?? 1) - 1,
      authors: post.author ? [post.author] : undefined,
    };
  });
  const eventCards = withColor(
    listedEvents(archiveItems(eventsFile)).map((item) => {
      const filter = site.eventFilters.find((entry) =>
        entry.eventIds.includes(item.id),
      );
      const card = toCard(item, {
        to: filter?.to ?? "/events",
        category: filter?.label,
      });
      return {
        ...card,
        excerpt: card.excerpt || firstSentence(item.content || ""),
      };
    }),
  );
  const programs: ProgramCard[] = page.programs.map((program) => {
    const record = pages.find((item) => item.id === program.page);
    const description =
      program.to === "/terminology"
        ? site.listings.terminology.description
        : firstSentence(record?.content || record?.excerpt || "");
    return { title: program.title, description, to: program.to };
  });
  return {
    page,
    mission: about.description ?? page.title,
    intro: about.lead ?? page.dek,
    groups: spotlightGroups(page.spotlight.groups),
    news: spotlightPosts,
    publications: publicationCards,
    events: eventCards,
    programs,
  };
});

if (!home.value?.page) {
  throw createError({ statusCode: 500, statusMessage: "محتوای خانه پیدا نشد" });
}

const view = home.value;
const page = view.page;

usePageSeo({
  title: view.mission,
  description: view.intro,
});
</script>

<template>
  <div>
    <HomeSplash :title="view.mission" :links="page.links" />
    <Spotlight
      :title="page.spotlight.heading"
      :intro="page.spotlight.intro"
      :posts-title="page.spotlight.postsTitle"
      :groups="view.groups"
      :posts="view.news"
      :link-label="page.readLabel"
      :by-label="site.ui.by"
    />
    <div class="home-contain home-contain--no-grid">
      <div class="home-latest home-latest--featured-projects deferred">
        <h2 class="home-latest__title">{{ page.projectsTitle }}</h2>
        <div class="home-latest__list project-list project-list--layout-3-col">
          <ProjectCard
            v-for="(program, index) in view.programs"
            :key="program.to"
            :title="program.title"
            :description="program.description"
            :to="program.to"
            :by-label="site.ui.by"
            :style="accentStyle(index)"
          />
        </div>
      </div>
    </div>
    <div class="home-slider-container home-slider-container--latest">
      <div class="home-contain home-contain--latest home-contain--no-grid">
        <div class="home-latest deferred">
          <h2 class="home-latest__title">{{ page.recentTitle }}</h2>
          <div class="home-latest__view-all">
            <NuxtLink to="/research">{{ page.recentLinkLabel }}</NuxtLink>
          </div>
          <SimpleSwiper :previous-label="site.ui.previous" :next-label="site.ui.next">
            <PostListing
              v-for="card in view.publications"
              :key="card.id"
              swiper
              :title="card.title"
              :to="card.to"
              :excerpt="card.excerpt"
              :category="card.category"
              :date="card.date"
              :image="card.image"
              :color-index="card.colorIndex"
              :link-label="page.readLabel"
              :by-label="site.ui.by"
            />
          </SimpleSwiper>
        </div>
      </div>
    </div>
    <div class="home-slider-container home-slider-container--latest">
      <div class="home-contain home-contain--latest home-contain--no-grid">
        <div class="home-latest deferred">
          <h2 class="home-latest__title">{{ page.sections.events }}</h2>
          <div class="home-latest__view-all">
            <NuxtLink to="/events">{{ page.sectionLinks.events }}</NuxtLink>
          </div>
          <SimpleSwiper :previous-label="site.ui.previous" :next-label="site.ui.next">
            <PostListing
              v-for="card in view.events"
              :key="card.id"
              swiper
              :title="card.title"
              :to="card.to"
              :excerpt="card.excerpt"
              :category="card.category"
              :date="card.date"
              :image="card.image"
              :color-index="card.colorIndex"
              :link-label="page.readLabel"
              :by-label="site.ui.by"
            />
          </SimpleSwiper>
        </div>
      </div>
    </div>
    <div class="home-contain home-contain--no-grid">
      <div class="home-latest home-latest--featured-projects deferred">
        <h2 class="home-latest__title">{{ page.sections.quarterlies }}</h2>
        <div class="home-latest__view-all">
          <NuxtLink to="/quarterlies">{{ page.sectionLinks.quarterlies }}</NuxtLink>
        </div>
        <div class="home-latest__list project-list project-list--layout-3-col">
          <ProjectCard
            v-for="(journal, index) in page.journals"
            :key="journal.href"
            :title="journal.title"
            :description="journal.description"
            :to="journal.href"
            :image="journal.image"
            :link-label="page.viewLabel"
            :by-label="site.ui.by"
            :style="accentStyle(index + 3)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
