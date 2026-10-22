<script setup lang="ts">
import type { HomeContent, SiteContent } from "~/types/content";
import type { ListingCard } from "~/utils/archive";

interface ProjectFields {
  path: string;
  title: string;
  description: string;
  authors?: string[];
  image?: string;
  featured?: boolean;
}

interface HomeCard extends ListingCard {
  colorIndex: number;
}

const { data: siteData } = await useSite();
if (!siteData.value) {
  throw createError({ statusCode: 500, statusMessage: "محتوای خانه پیدا نشد" });
}
const site = siteData.value as SiteContent;

const { data: home } = await useAsyncData("home-page", async () => {
  const [pageFile, postsFile, projects] = await Promise.all([
    queryCollection("home").first(),
    queryCollection("archivePosts").first(),
    queryCollection("projects").order("stem", "ASC").all(),
  ]);
  if (!pageFile) return null;
  const page = pageFile as HomeContent;
  const posts = archiveItems(postsFile);
  const publications = byDateDesc(
    posts.filter((item) => itemInSet(item, site.sets.publications)),
  );
  const seenCategories: string[] = [];
  const publicationCards = publications.slice(0, 6).map((item) => {
    const category = categoryName(item, site.sets.publications);
    const name = category ?? "";
    let colorIndex = seenCategories.indexOf(name);
    if (colorIndex < 0) {
      seenCategories.push(name);
      colorIndex = seenCategories.length - 1;
    }
    return {
      ...toCard(item, {
        to: researchPath(item.slug),
        category,
      }),
      colorIndex,
    } satisfies HomeCard;
  });
  const terminology = site.nav.find((item) => item.to === "/terminology");
  const groups = spotlightGroups(posts, site.sets.workgroups, site.sets.publications, {
    label: terminology?.label ?? site.listings.terminology.title,
    to: "/terminology",
    body: site.listings.terminology.description,
  });
  const projectCards = (projects as ProjectFields[]).filter((item) => item.featured);

  return {
    page,
    groups,
    spotlight: publicationCards.slice(0, 3),
    publications: publicationCards,
    projects: projectCards.length ? projectCards : (projects as ProjectFields[]),
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
    <Spotlight
      :title="page.spotlightTitle"
      :intro="page.dek"
      :posts-title="page.sections.publications"
      :groups="view.groups"
      :posts="view.spotlight"
    />
    <div class="home-contain home-contain--no-grid">
      <div class="home-latest home-latest--featured-projects deferred">
        <h2 class="home-latest__title">{{ page.projectsTitle }}</h2>
        <div class="home-latest__view-all">
          <NuxtLink to="/projects">{{ page.projectsLinkLabel }}</NuxtLink>
        </div>
        <div class="home-latest__list project-list project-list--layout-3-col">
          <ProjectCard
            v-for="project in view.projects"
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
            />
          </SimpleSwiper>
        </div>
      </div>
    </div>
  </div>
</template>
