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
  <section class="page-wrap py-16 md:py-20">
    <h1 class="font-heading text-4xl font-medium text-primary md:text-6xl">
      {{ listing.title }}
    </h1>
    <p class="mt-6 max-w-2xl text-lg leading-relaxed">{{ listing.description }}</p>
    <div class="mt-12 grid gap-12 md:grid-cols-3">
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
  </section>
</template>
