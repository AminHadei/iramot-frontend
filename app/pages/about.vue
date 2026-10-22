<script setup lang="ts">
import type { HomeContent, SiteContent } from "~/types/content";

const { data: siteData } = await useSite();
if (!siteData.value) {
  throw createError({ statusCode: 500, statusMessage: "محتوای سایت پیدا نشد" });
}
const site = siteData.value as SiteContent;

const { data: about } = await useAsyncData("about-page", async () => {
  const [pagesFile, postsFile, aboutDoc, homeFile] = await Promise.all([
    queryCollection("archivePages").first(),
    queryCollection("archivePosts").first(),
    queryCollection("pages").path("/about").first(),
    queryCollection("home").first(),
  ]);
  const record = archiveItems(pagesFile).find((item) => item.id === site.pages.about);
  if (!record || !aboutDoc || !homeFile) return null;
  const board = byDateDesc(
    archiveItems(postsFile).filter(
      (item) =>
        item.tags?.some((tag) => tag.slug === site.sets.boardTag) &&
        itemInSet(item, site.sets.publications),
    ),
  ).map((item) => ({
    id: item.id,
    title: item.title,
    to: researchPath(item.slug),
  }));
  return {
    title: record.title,
    board,
    doc: aboutDoc,
    home: homeFile as HomeContent,
  };
});

if (!about.value) {
  throw createError({ statusCode: 404, statusMessage: site.ui.notFound });
}

const page = about.value;

usePageSeo({
  title: page.title,
  description: page.home.dek,
});
</script>

<template>
  <div>
    <div class="hero-intro">
      <h1 class="hero-intro__title">{{ page.title }}</h1>
      <div class="hero-intro__body">
        <ContentRenderer :value="page.doc" />
      </div>
    </div>
    <div class="quick-links">
      <a class="quick-links__link" href="#team">{{ site.ui.team }}</a>
    </div>
    <div class="people-group-list">
      <div id="team" class="people-group-list__wrapper">
        <div
          v-for="mode in ['desktop', 'mobile']"
          :key="mode"
          class="people-group-list__group people-group"
          :class="`people-group--${mode}`"
        >
          <h2 class="people-group__title">{{ site.ui.team }}</h2>
          <div v-if="!page.board.length" class="people-group__description">
            {{ site.ui.emptyPeople }}
          </div>
          <div v-else class="people-group__list">
            <div
              v-for="post in page.board"
              :key="`${mode}-${post.id}`"
              class="people-group__person person-card"
            >
              <div class="person-card__name">
                <NuxtLink :to="post.to">{{ post.title }}</NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="page-template-template-home">
      <div class="home-contain home-contain--no-grid">
        <div class="home-latest home-latest--featured-projects deferred">
          <h2 class="home-latest__title">{{ page.home.sections.partners }}</h2>
          <div class="home-latest__view-all">
            <NuxtLink to="/partners">{{ page.home.sectionLinks.partners }}</NuxtLink>
          </div>
          <div class="home-latest__list project-list project-list--layout-3-col">
            <p class="project__description">{{ page.home.partnersEmpty }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
