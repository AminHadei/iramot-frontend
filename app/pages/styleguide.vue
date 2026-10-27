<script setup lang="ts">
import type { ArchiveItem, FocusArea, HomeContent, SiteContent } from "~/types/content";
import {
  createApiHomeRepository,
  createApiSiteRepository,
} from "~/data/singletons/api";
import { sectionApiBase, sectionMode, withJsonFallback } from "~/utils/contentSource";

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

const areasRepo = useAreaRepository();
const projectsRepo = useProjectRepository();
const contentConfig = useRuntimeConfig();
const { data } = await useAsyncData("styleguide", async () => {
  const jsonAreas = () => queryCollection("areas").order("stem", "ASC").all();
  const jsonProjects = () => queryCollection("projects").order("stem", "ASC").all();
  const siteRequest = withJsonFallback(
    sectionMode(contentConfig.public, "site"),
    () =>
      createApiSiteRepository(
        sectionApiBase(contentConfig.public, "site"),
        contentConfig.app.baseURL,
      ).get(),
    () => queryCollection("site").first(),
  );
  const homeRequest = withJsonFallback(
    sectionMode(contentConfig.public, "home"),
    () =>
      createApiHomeRepository(
        sectionApiBase(contentConfig.public, "home"),
        contentConfig.app.baseURL,
      ).get(),
    () => queryCollection("home").first(),
  );
  const [site, home, areas, projects, about, postsFile, eventsFile, termsFile] =
    await Promise.all([
      siteRequest,
      homeRequest,
      sectionMode(contentConfig.public, "areas") === "api"
        ? areasRepo.list()
        : jsonAreas(),
      sectionMode(contentConfig.public, "projects") === "api"
        ? projectsRepo.list()
        : jsonProjects(),
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
      ...toCards(posts, "/news", 4),
      ...toCards(events, "/events", 2),
      ...toCards(terms, "/terminology", 3),
    ],
    article: toCards(posts, "/news", 1)[0],
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
const partnerList = await usePartnerList();
const quarterlyList = await useQuarterlyList();
const partners = partnerList.data.value?.items ?? [];
const quarterlies = quarterlyList.data.value?.items ?? [];

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
            <NuxtLink to="/news">{{ home.recentLinkLabel }}</NuxtLink>
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
              :link-label="home.readLabel"
              :by-label="site.ui.by"
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
    <section class="people-group-list list-page">
      <h2 class="font-heading text-3xl text-primary">
        {{ site.listings.partners.title }}
      </h2>
      <ul class="people-group__list list-grid list-grid--logos">
        <li v-for="item in partners" :key="item.id">
          <IfpListCard
            :name="item.name"
            media="logo"
            :tone="item.tone"
            :image="item.image"
            :description="item.description"
            :links="item.url ? [{ href: item.url, label: site.ui.listWebsite }] : []"
            :external-label="site.ui.listExternal"
          />
        </li>
      </ul>
      <ul class="people-group__list list-grid">
        <li v-for="item in quarterlies" :key="item.id">
          <IfpListCard
            :name="item.name"
            media="cover"
            :tone="item.tone"
            :image="item.image"
            :description="item.description"
            :links="item.url ? [{ href: item.url, label: site.ui.listWebsite }] : []"
            :external-label="site.ui.listExternal"
          />
        </li>
      </ul>
    </section>
  </div>
</template>
