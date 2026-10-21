<script setup lang="ts">
import type { SiteContent } from "~/types/content";

const { data: siteData } = await useSite();
if (!siteData.value) {
  throw createError({ statusCode: 500, statusMessage: "محتوای سایت پیدا نشد" });
}
const site = siteData.value as SiteContent;
const statute = site.listings.statute;

usePageSeo({
  title: statute.title,
  description: statute.description,
});
</script>

<template>
  <div>
    <HeroIntro :title="statute.title" :dek="statute.description" />
    <p class="page-inset pb-16">
      <a :href="statute.file" class="text-primary">{{ statute.label }}</a>
    </p>
  </div>
</template>
