<script setup lang="ts">
const route = useRoute();
const { data: site } = await useSite();

const slug = computed(() => {
  const value = route.params.slug;
  return Array.isArray(value) ? value[0] : value;
});

const projectsRepo = useProjectRepository();
const { data: project } = await useAsyncData(
  () => `project-${slug.value}`,
  () => projectsRepo.get(slug.value ?? ""),
);

if (!project.value || !site.value) {
  throw createError({
    statusCode: 404,
    statusMessage: site.value?.ui.notFound ?? "پیدا نشد",
  });
}

usePageSeo({
  title: project.value.title,
  description: project.value.description,
  type: "article",
});
</script>

<template>
  <article
    v-if="project && site && 'bodyHtml' in project && project.bodyHtml"
    class="page-wrap py-16 md:py-20"
  >
    <h1
      class="mt-4 max-w-4xl font-heading text-4xl font-medium text-primary md:text-6xl"
    >
      {{ project.title }}
    </h1>
    <p v-if="project.description" class="mt-6 max-w-2xl text-lg leading-relaxed">
      {{ project.description }}
    </p>
    <div class="rich-text mt-10 max-w-3xl">
      <ArchiveHtml :html="project.bodyHtml" />
    </div>
  </article>
  <ArticleDocument
    v-else-if="project && site"
    :doc="project"
    :title="project.title"
    :description="project.description"
    :authors="project.authors"
    :image="project.image"
    :by-label="site.ui.by"
  />
</template>
