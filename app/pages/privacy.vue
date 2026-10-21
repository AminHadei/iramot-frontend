<script setup lang="ts">
import type { SiteContent } from "~/types/content";

const { data: siteData } = await useSite();
if (!siteData.value) {
  throw createError({ statusCode: 500, statusMessage: "محتوای سایت پیدا نشد" });
}
const site = siteData.value as SiteContent;

const { data: privacy } = await useAsyncData("privacy-page", async () => {
  const record = archiveItems(await queryCollection("archivePages").first()).find(
    (item) => item.id === site.pages.privacy,
  );
  if (!record) return null;
  const prepared = articleHtml(record.content ?? "");
  return {
    title: record.title,
    description: plainText(record.excerpt || record.title),
    html: prepared.html,
    toc: prepared.toc,
  };
});

if (!privacy.value) {
  throw createError({ statusCode: 404, statusMessage: site.ui.notFound });
}

const page = privacy.value;

usePageSeo({
  title: page.title,
  description: page.description,
});
</script>

<template>
  <SingleArticle :title="page.title" :toc="page.toc">
    <ArchiveHtml :html="page.html" />
  </SingleArticle>
</template>
