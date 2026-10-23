<script setup lang="ts">
import type { SiteContent } from "~/types/content";

const { data: siteData } = await useSite();
if (!siteData.value) {
  throw createError({ statusCode: 500, statusMessage: "محتوای سایت پیدا نشد" });
}
const site = siteData.value as SiteContent;
const list = await usePartnerList();
const items = list.data.value?.items ?? [];

usePageSeo({
  title: site.listings.partners.title,
  description: site.listings.partners.description,
});
</script>

<template>
  <IfpRecordList
    :title="site.listings.partners.title"
    :description="site.listings.partners.description"
    :items="items"
    media="logo"
    wide
    :empty="site.ui.emptyPartners"
    :website-label="site.ui.listWebsite"
    :external-label="site.ui.listExternal"
  />
</template>
