<script setup lang="ts">
import type { SiteContent } from "~/types/content";

const route = useRoute();
const slug = oneParam(route.params.slug);
const siteState = useSite();
const eventState = useEvent(slug);
const siteData = await siteState;
const event = await eventState;
const site = siteData.data.value as SiteContent | null;

if (!site || !event.data.value) {
  throw createError({ statusCode: 404, statusMessage: site?.ui.notFound });
}

const record = event.data.value;

usePageSeo({
  title: record.title,
  description: record.excerpt || record.title,
  type: "article",
});
</script>

<template>
  <EventArticle :event="record" :site="site" />
</template>
