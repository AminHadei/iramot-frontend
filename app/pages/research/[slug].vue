<script setup lang="ts">
import type { SiteContent } from "~/types/content";

const route = useRoute();
const slug = oneParam(route.params.slug);
const { data: siteData } = await useSite();

if (!siteData.value) {
  throw createError({ statusCode: 500, statusMessage: "محتوای سایت پیدا نشد" });
}

const site = siteData.value as SiteContent;

const { data: article } = await useAsyncData(`research-${slug}`, async () => {
  const posts = archiveItems(await queryCollection("archivePosts").first());
  const item = posts.find(
    (entry) => entry.slug === slug && itemInSet(entry, site.sets.publications),
  );
  if (!item) return null;
  const prepared = articleHtml(item.content ?? "");
  return {
    title: item.title,
    description: plainText(item.excerpt || item.title),
    date: item.date,
    category: categoryName(item, site.sets.publications),
    image: item.featuredImage?.localPath || undefined,
    html: prepared.html,
    toc: prepared.toc,
  };
});

if (!article.value) {
  throw createError({ statusCode: 404, statusMessage: site.ui.notFound });
}

const post = article.value;

usePageSeo({
  title: post.title,
  description: post.description,
  type: "article",
});
</script>

<template>
  <SingleArticle
    :title="post.title"
    :category="post.category"
    :date="post.date"
    :image="post.image"
    :toc="post.toc"
  >
    <ArchiveHtml v-if="post.html" :html="post.html" />
  </SingleArticle>
</template>
