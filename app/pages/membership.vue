<script setup lang="ts">
import type { SiteContent } from "~/types/content";

const siteState = useSite();
const state = useAsyncData("membership-page", async () => {
  const site = (await siteState).data.value as SiteContent | null;
  if (!site) return null;
  const record = archiveItems(await queryCollection("archivePages").first()).find(
    (item) => item.id === site.pages.membership,
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

const site = (await siteState).data.value as SiteContent | null;
if (!site) {
  throw createError({ statusCode: 500, statusMessage: "محتوای سایت پیدا نشد" });
}
const { data } = await state;
if (!data.value) {
  throw createError({ statusCode: 404, statusMessage: site.ui.notFound });
}
const page = data.value;

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
