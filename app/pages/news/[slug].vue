<script setup lang="ts">
import type { SiteContent } from "~/types/content";

const route = useRoute();
const slug = oneParam(route.params.slug);
const siteState = useSite();
const newsState = useNews(slug);
const siteData = await siteState;
const news = await newsState;
const site = siteData.data.value as SiteContent | null;

if (!site || !news.data.value) {
  throw createError({ statusCode: 404, statusMessage: site?.ui.notFound });
}

const post = news.data.value;

usePageSeo({
  title: post.title,
  description: post.excerpt || post.title,
  type: "article",
});
</script>

<template>
  <NewsArticle :post="post" :site="site" />
</template>
