<script setup lang="ts">
const { data: page } = await useAsyncData("about", () =>
  queryCollection("pages").path("/about").first(),
);

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: "پیدا نشد" });
}

usePageSeo({
  title: page.value.title,
  description: page.value.description,
});
</script>

<template>
  <article v-if="page" class="page-wrap py-16 md:py-20">
    <h1 class="max-w-4xl font-heading text-4xl font-medium text-primary md:text-6xl">
      {{ page.title }}
    </h1>
    <p class="mt-6 max-w-2xl text-lg leading-relaxed">{{ page.description }}</p>
    <div class="rich-text mt-10 max-w-3xl">
      <ContentRenderer :value="page" />
    </div>
  </article>
</template>
