<script setup lang="ts">
import type { ArchiveItem, FocusArea, HomeContent, SiteContent } from "~/types/content";

interface ArchiveFile {
  body?: ArchiveItem[];
}

interface GuideCard {
  id: number;
  title: string;
  to: string;
  excerpt: string;
  category?: string;
  date?: string;
  image?: string;
}

interface GuideProject {
  path: string;
  title: string;
  description: string;
  authors?: string[];
  image?: string;
}

function toCards(items: ArchiveItem[] | undefined, to: string, limit: number) {
  return (items ?? []).slice(0, limit).map((item): GuideCard => ({
    id: item.id,
    title: item.title,
    to,
    excerpt: plainText(item.excerpt ?? ""),
    category: item.categories?.[0]?.name,
    date: item.date,
    image: item.featuredImage?.localPath || undefined,
  }));
}

const { data } = await useAsyncData("styleguide", async () => {
  const [site, home, areas, projects, about, postsFile, eventsFile, termsFile] =
    await Promise.all([
      queryCollection("site").first(),
      queryCollection("home").first(),
      queryCollection("areas").order("stem", "ASC").all(),
      queryCollection("projects").order("stem", "ASC").all(),
      queryCollection("pages").path("/about").first(),
      queryCollection("archivePosts").first(),
      queryCollection("archiveEvents").first(),
      queryCollection("archiveTerms").first(),
    ]);

  const posts = ((postsFile as ArchiveFile | null)?.body ?? []).filter(
    (item) => item.featuredImage?.localPath,
  );
  const events = ((eventsFile as ArchiveFile | null)?.body ?? []).filter(
    (item) => item.featuredImage?.localPath,
  );
  const terms = (termsFile as ArchiveFile | null)?.body;

  return {
    site,
    home,
    areas,
    projects,
    about,
    cards: [
      ...toCards(posts, "/research", 4),
      ...toCards(events, "/events", 2),
      ...toCards(terms, "/terminology", 3),
    ],
    article: toCards(posts, "/research", 1)[0],
  };
});

if (!data.value?.site || !data.value.home || !data.value.about || !data.value.article) {
  throw createError({ statusCode: 500, statusMessage: "محتوای راهنما پیدا نشد" });
}

const guide = data.value;
const site = guide.site as SiteContent;
const home = guide.home as HomeContent;
const areas = guide.areas as FocusArea[];
const projects = guide.projects as GuideProject[];
const about = guide.about as { title: string; description: string };
const cards = guide.cards;
const article = guide.article as GuideCard;

usePageSeo({
  title: site.styleguide.title,
  description: site.styleguide.description,
});
</script>

<template>
  <div>
    <HomeSplash :title="home.title" :links="home.links" />
    <HeroIntro :title="about.title" :dek="about.description" />
    <Spotlight
      :title="home.spotlightTitle"
      :intro="home.dek"
      :posts-title="home.sections.publications"
      :groups="
        areas.map((area) => ({ title: area.title, body: area.question, to: area.to }))
      "
      :posts="cards.slice(0, 3)"
    />
    <div class="home-slider-container home-slider-container--latest">
      <div class="home-contain home-contain--latest home-contain--no-grid">
        <div class="home-latest">
          <h2 class="home-latest__title">{{ site.styleguide.listing }}</h2>
          <div class="home-latest__view-all">
            <NuxtLink to="/research">{{ home.recentLinkLabel }}</NuxtLink>
          </div>
          <SimpleSwiper :previous-label="site.ui.previous" :next-label="site.ui.next">
            <PostListing
              v-for="(card, index) in cards"
              :key="card.id"
              swiper
              :title="card.title"
              :to="card.to"
              :excerpt="card.excerpt"
              :category="card.category"
              :date="card.date"
              :image="card.image"
              :color-index="index"
            />
          </SimpleSwiper>
        </div>
      </div>
    </div>
    <div class="home-contain home-contain--no-grid">
      <div class="home-latest home-latest--featured-projects">
        <h2 class="home-latest__title">{{ site.styleguide.projects }}</h2>
        <div class="home-latest__view-all">
          <NuxtLink to="/projects">{{ home.projectsLinkLabel }}</NuxtLink>
        </div>
        <div class="home-latest__list project-list project-list--layout-3-col">
          <ProjectCard
            v-for="project in projects"
            :key="project.path"
            :title="project.title"
            :description="project.description"
            :to="project.path"
            :authors="project.authors"
            :image="project.image"
            :by-label="site.ui.by"
          />
        </div>
      </div>
    </div>
    <SingleArticle
      :title="article.title"
      :category="article.category"
      :date="article.date"
    >
      <p>{{ article.excerpt }}</p>
    </SingleArticle>
    <section class="page-inset pb-16">
      <h2 class="font-heading text-3xl text-primary">{{ site.styleguide.people }}</h2>
      <PersonCard class="mt-8 max-w-sm" :empty-label="site.styleguide.emptyPerson" />
    </section>
  </div>
</template>
