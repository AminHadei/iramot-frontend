<script setup lang="ts">
import type { SiteContent } from "~/types/content";

const siteState = useSite();
const baseURL = useRuntimeConfig().app.baseURL;
const articleState = useAsyncData("award-article", async () => {
  const site = (await siteState).data.value as SiteContent | null;
  if (!site) return null;
  const record = archiveItems(await queryCollection("archivePages").first()).find(
    (item) => item.id === site.pages.award,
  );
  if (!record) return null;
  const prepared = articleHtml(record.content ?? "", baseURL);
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
const tocOpen = ref(false);

usePageSeo({
  title: article.title,
  description: article.description,
});
</script>

<template>
  <div>
    <div class="hero-intro">
      <h1 class="hero-intro__title">{{ article.title }}</h1>
      <div v-if="article.description" class="hero-intro__body">
        <p>{{ article.description }}</p>
      </div>
    </div>
    <div class="half-content">
      <ul
        v-if="article.toc.length"
        class="toc toc--has-list-items"
        :class="{ 'toc--nav-open': tocOpen }"
      >
        <li
          class="toc__button"
          role="button"
          tabindex="0"
          @click="tocOpen = !tocOpen"
          @keydown.enter.prevent="tocOpen = !tocOpen"
        >
          <div class="toc__button-text">{{ article.title }}</div>
        </li>
        <li class="toc__list">
          <div class="toc__list-container">
            <ul>
              <li v-for="item in article.toc" :key="item.id" class="toc__item">
                <a class="toc__link" :href="`#${item.id}`">{{ item.label }}</a>
              </li>
            </ul>
          </div>
        </li>
      </ul>
      <div class="half-content__body">
        <ArchiveHtml :html="article.html" />
      </div>
    </div>
    <ArchiveListing v-bind="listing" shell="archive" title="" description="" />
  </div>
</template>
