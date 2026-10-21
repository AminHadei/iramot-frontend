<script setup lang="ts">
import type { SiteContent } from "~/types/content";

const { data: siteData } = await useSite();
if (!siteData.value) {
  throw createError({ statusCode: 500, statusMessage: "محتوای سایت پیدا نشد" });
}
const site = siteData.value as SiteContent;

const { data: about } = await useAsyncData("about-page", async () => {
  const [pagesFile, postsFile] = await Promise.all([
    queryCollection("archivePages").first(),
    queryCollection("archivePosts").first(),
  ]);
  const record = archiveItems(pagesFile).find((item) => item.id === site.pages.about);
  if (!record) return null;
  const board = byDateDesc(
    archiveItems(postsFile).filter(
      (item) =>
        item.tags?.some((tag) => tag.slug === site.sets.boardTag) &&
        itemInSet(item, site.sets.publications),
    ),
  ).map((item) => ({
    id: item.id,
    title: item.title,
    to: researchPath(item.slug),
  }));
  return { title: record.title, board };
});

if (!about.value) {
  throw createError({ statusCode: 404, statusMessage: site.ui.notFound });
}

const page = about.value;

usePageSeo({
  title: page.title,
  description: site.ui.emptyBody,
});
</script>

<template>
  <div>
    <HeroIntro :title="page.title" :dek="site.ui.emptyBody" />
    <section id="team" class="page-inset pb-16">
      <h2 class="font-heading text-3xl text-primary">{{ site.ui.team }}</h2>
      <PersonCard class="mt-8 max-w-sm" :empty-label="site.ui.emptyPeople" />
      <ul
        v-if="page.board.length"
        class="mt-8 divide-y divide-line border-y border-line"
      >
        <li v-for="post in page.board" :key="post.id">
          <NuxtLink :to="post.to" class="block py-3 text-ink">{{
            post.title
          }}</NuxtLink>
        </li>
      </ul>
    </section>
  </div>
</template>
