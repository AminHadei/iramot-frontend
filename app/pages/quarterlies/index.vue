<script setup lang="ts">
import type { SiteContent } from "~/types/content";

const { data: siteData } = await useSite();
if (!siteData.value) {
  throw createError({ statusCode: 500, statusMessage: "محتوای سایت پیدا نشد" });
}
const site = siteData.value as SiteContent;
const list = await useQuarterlyList();
const items = list.data.value?.items ?? [];

usePageSeo({
  title: site.listings.quarterlies.title,
  description: site.listings.quarterlies.description,
});
</script>

<template>
  <IfpRecordList
    :title="site.listings.quarterlies.title"
    :description="site.listings.quarterlies.description"
    :items="items"
    media="cover"
    :empty="site.ui.emptyQuarterlies"
    :website-label="site.ui.listWebsite"
    :external-label="site.ui.listExternal"
  />
</template>
