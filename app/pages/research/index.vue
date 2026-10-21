<script setup lang="ts">
const { data: site } = await useSite();
const { data: posts } = await useAsyncData("research-index", () =>
  queryCollection("posts").order("date", "DESC").all(),
);

if (!site.value) {
  throw createError({ statusCode: 500, statusMessage: "محتوای سایت پیدا نشد" });
}

const listing = site.value.listings.research;
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
    <div class="mt-10">
      <ArticleRow
        v-for="post in posts"
        :key="post.path"
        :article="post"
        :by-label="siteContent.ui.by"
      />
    </div>
  </section>
</template>
