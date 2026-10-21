<script setup lang="ts">
const route = useRoute();
const { data: site } = await useSite();

const slug = computed(() => {
  const value = route.params.slug;
  return Array.isArray(value) ? value[0] : value;
});

const { data: post } = await useAsyncData(
  () => `research-${slug.value}`,
  () => queryCollection("posts").path(`/research/${slug.value}`).first(),
);

if (!post.value || !site.value) {
  throw createError({
    statusCode: 404,
    statusMessage: site.value?.ui.notFound ?? "پیدا نشد",
  });
}

usePageSeo({
  title: post.value.title,
  description: post.value.description,
  type: "article",
});
</script>

<template>
  <ArticleDocument
    v-if="post && site"
    :doc="post"
    :title="post.title"
    :description="post.description"
    :date="post.date"
    :category="post.category"
    :authors="post.authors"
    :image="post.image"
    :by-label="site.ui.by"
  />
</template>
