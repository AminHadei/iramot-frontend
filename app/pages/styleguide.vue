<script setup lang="ts">
import type { ArchiveItem, FocusArea, HomeContent, SiteContent } from "~/types/content";
import {
  createApiAboutRepository,
  createApiHomeRepository,
  createApiSiteRepository,
} from "~/data/singletons/api";

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
const newsRepo = useNewsRepository();
const eventRepo = useEventRepository();
const termRepo = useTermRepository();
const contentConfig = useRuntimeConfig();
const { data } = await useAsyncData("styleguide", async () => {
  const apiBase = useContentApiBase();
  const [site, home, areas, projects, aboutDoc, newsList, eventList, termList] =
    await Promise.all([
      createApiSiteRepository(apiBase, contentConfig.app.baseURL).get(),
      createApiHomeRepository(apiBase, contentConfig.app.baseURL).get(),
      areasRepo.list(),
      projectsRepo.list(),
      createApiAboutRepository(apiBase, contentConfig.app.baseURL).get(),
      newsRepo.list({ page: 1, perPage: 4, order: "desc" }),
      eventRepo.list({ page: 1, perPage: 2, order: "desc" }),
      termRepo.list(),
    ]);

  const aboutRecord = aboutDoc as {
    title?: string;
    about?: { body?: string[] };
  } | null;
  const about = aboutRecord
    ? {
        title: aboutRecord.title ?? "",
        description: aboutRecord.about?.body?.[0] ?? "",
      }
    : null;
  const posts: ArchiveItem[] = (newsList.items ?? []).map((item) => ({
    id: Number(item.id) || 0,
    slug: item.slug,
    title: item.title,
    excerpt: item.excerpt,
    date: item.date,
    categories: item.categories.map((category) => ({
      id: 0,
      slug: category.slug,
      name: category.name,
    })),
    featuredImage: item.image?.url ? { localPath: item.image.url } : null,
  }));
  const events: ArchiveItem[] = (eventList.items ?? []).map((item) => ({
    id: Number(item.id) || 0,
    slug: item.slug,
    title: item.title,
    excerpt: item.excerpt,
    date: item.dateText ?? item.startsAt ?? "",
    featuredImage: item.poster ? { localPath: item.poster } : null,
  }));
  const terms: ArchiveItem[] = (termList.items ?? []).slice(0, 3).map((item) => ({
    id: Number(item.id) || 0,
    slug: item.slug,
    title: item.title,
    excerpt: item.text,
    date: item.date ?? "",
  }));

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
