<script setup lang="ts">
import type { SiteContent } from "~/types/content";

const siteState = useSite();
const articleState = useAsyncData("award-article", async () => {
  const site = (await siteState).data.value as SiteContent | null;
  if (!site) return null;
  const record = archiveItems(await queryCollection("archivePages").first()).find(
    (item) => item.id === site.pages.award,
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
const listing = await useArchiveListing("award");
const site = (await siteState).data.value as SiteContent | null;
if (!site) {
  throw createError({ statusCode: 500, statusMessage: "محتوای سایت پیدا نشد" });
}
const { data } = await articleState;
if (!data.value) {
  throw createError({ statusCode: 404, statusMessage: site.ui.notFound });
}
const article = data.value;

usePageSeo({
  title: article.title,
  description: article.description,
});
</script>

<template>
  <div>
    <SingleArticle :title="article.title" :toc="article.toc">
      <ArchiveHtml :html="article.html" />
    </SingleArticle>
    <ArchiveListing v-bind="listing" title="" description="" />
  </div>
</template>
