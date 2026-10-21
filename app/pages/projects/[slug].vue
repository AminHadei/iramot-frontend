<script setup lang="ts">
const route = useRoute();
const { data: site } = await useSite();

const slug = computed(() => {
  const value = route.params.slug;
  return Array.isArray(value) ? value[0] : value;
});

const { data: project } = await useAsyncData(
  () => `project-${slug.value}`,
  () => queryCollection("projects").path(`/projects/${slug.value}`).first(),
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
  <ArticleDocument
    v-if="project && site"
    :doc="project"
    :title="project.title"
    :description="project.description"
    :authors="project.authors"
    :image="project.image"
    :by-label="site.ui.by"
  />
</template>
