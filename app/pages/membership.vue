<script setup lang="ts">
import type { SiteContent } from "~/types/content";
import { createApiPageRepository } from "~/data/pages/api";
import { sectionApiBase, sectionMode, withJsonFallback } from "~/utils/contentSource";

const siteState = useSite();
const config = useRuntimeConfig();
const baseURL = config.app.baseURL;
const state = useAsyncData("membership-page", async () => {
  const site = (await siteState).data.value as SiteContent | null;
  if (!site) return null;
  const record = await withJsonFallback(
    sectionMode(config.public, "pages"),
    () =>
      createApiPageRepository(sectionApiBase(config.public, "pages"), baseURL).get(
        site.pages.membership,
      ),
    async () =>
      archiveItems(await queryCollection("archivePages").first()).find(
        (item) => item.id === site.pages.membership,
      ) ?? null,
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

const site = (await siteState).data.value as SiteContent | null;
if (!site) {
  throw createError({ statusCode: 500, statusMessage: "محتوای سایت پیدا نشد" });
}
const { data } = await state;
if (!data.value) {
  throw createError({ statusCode: 404, statusMessage: site.ui.notFound });
}
const page = data.value;
const tocOpen = ref(false);

usePageSeo({
  title: page.title,
  description: page.description,
});
</script>

<template>
  <div>
    <div class="hero-intro">
      <h1 class="hero-intro__title">{{ page.title }}</h1>
      <div v-if="page.description" class="hero-intro__body">
        <p>{{ page.description }}</p>
      </div>
    </div>
    <div class="half-content">
      <ul
        v-if="page.toc.length"
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
          <div class="toc__button-text">{{ page.title }}</div>
        </li>
        <li class="toc__list">
          <div class="toc__list-container">
            <ul>
              <li v-for="item in page.toc" :key="item.id" class="toc__item">
                <a class="toc__link" :href="`#${item.id}`">{{ item.label }}</a>
              </li>
            </ul>
          </div>
        </li>
      </ul>
      <div class="half-content__body">
        <ArchiveHtml :html="page.html" />
      </div>
    </div>
  </div>
</template>
