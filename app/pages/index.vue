<script setup lang="ts">
import type { ArticleFields, FocusArea, HomeContent } from "~/types/content";

const { data: site } = await useSite();
const { data: home } = await useAsyncData("home-page", async () => {
  const [page, areas, spotlight, recent, projects] = await Promise.all([
    queryCollection("home").first(),
    queryCollection("areas").order("stem", "ASC").all(),
    queryCollection("posts").where("spotlight", "=", true).order("date", "DESC").all(),
    queryCollection("posts").where("spotlight", "=", false).order("date", "DESC").all(),
    queryCollection("projects").where("featured", "=", true).order("stem", "ASC").all(),
  ]);

  return { page, areas, spotlight, recent, projects };
});

if (!home.value?.page || !site.value) {
  throw createError({ statusCode: 500, statusMessage: "محتوای خانه پیدا نشد" });
}

const page = home.value.page as HomeContent;
const areas = home.value.areas as FocusArea[];
const spotlight = home.value.spotlight as ArticleFields[];
const recent = home.value.recent as ArticleFields[];
const siteContent = site.value;

usePageSeo({
  title: page.title,
  description: page.dek,
});
</script>

<template>
  <div>
    <HeroBlock
      :eyebrow="page.eyebrow"
      :title="page.title"
      :dek="page.dek"
      :links="page.links"
    />
    <FocusList :areas="areas" />
    <section class="page-wrap py-16 md:py-20">
      <SectionHeading :title="page.spotlightTitle" />
      <div class="mt-4">
        <ArticleRow
          v-for="(post, index) in spotlight"
          :key="post.path"
          :article="post"
          :by-label="siteContent.ui.by"
          :large="index === 0"
        />
      </div>
    </section>
    <section class="border-t border-line">
      <div class="page-wrap py-16 md:py-20">
        <SectionHeading
          :title="page.projectsTitle"
          to="/projects"
          :link-label="page.projectsLinkLabel"
        />
        <div class="mt-10 grid gap-12 md:grid-cols-3">
          <ProjectCard
            v-for="project in home?.projects"
            :key="project.path"
            :title="project.title"
            :description="project.description"
            :to="project.path"
            :authors="project.authors"
            :image="project.image"
            :by-label="siteContent.ui.by"
          />
        </div>
      </div>
    </section>
    <section class="border-t border-line">
      <div class="page-wrap py-16 md:py-20">
        <SectionHeading
          :title="page.recentTitle"
          to="/research"
          :link-label="page.recentLinkLabel"
        />
        <div class="mt-4">
          <ArticleRow
            v-for="post in recent"
            :key="post.path"
            :article="post"
            :by-label="siteContent.ui.by"
          />
        </div>
      </div>
    </section>
  </div>
</template>
