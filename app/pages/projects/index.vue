<script setup lang="ts">
const { data: site } = await useSite();
const { data: projects } = await useAsyncData("projects-index", () =>
  queryCollection("projects").order("stem", "ASC").all(),
);

if (!site.value) {
  throw createError({ statusCode: 500, statusMessage: "محتوای سایت پیدا نشد" });
}

const listing = site.value.listings.projects;
const siteContent = site.value;

usePageSeo({
  title: listing.title,
  description: listing.description,
});
</script>

<template>
  <div>
    <div class="hero-intro">
      <h1 class="hero-intro__title">{{ listing.title }}</h1>
      <div class="hero-intro__body">
        <p>{{ listing.description }}</p>
      </div>
    </div>
    <div class="projects">
      <div class="project-list project-list--layout-3-col">
        <ProjectCard
          v-for="project in projects"
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
  </div>
</template>
