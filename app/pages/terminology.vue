<script setup lang="ts">
import type { SiteContent } from "~/types/content";
import { withBase } from "~/utils/withBase";

const siteState = useSite();
const repo = useTermRepository();
const route = useRoute();
const request = useRequestURL();
const config = useRuntimeConfig();
const baseURL = config.app.baseURL;
const noindex = ref(false);
const heroStyle = {
  "--hero-blend": `url("${withBase(baseURL, "/images/hero-intro-blend-1.webp")}")`,
};
const state = useAsyncData("terminology-page", async () => {
  const site = (await siteState).data.value as SiteContent | null;
  if (!site) return null;
  const listed = await repo.list();
  return {
    title: site.listings.terminology.title,
    description: site.listings.terminology.description,
    copy: site.listings.terminology,
    allLabel: site.ui.all,
    sources: site.terminology.sources,
    terms: listed.items,
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
useHead(() => ({
  link: [
    {
      rel: "canonical",
      href: new URL(withBase(baseURL, route.path), request.origin).href,
    },
  ],
  meta: noindex.value
    ? [{ key: "term-robots", name: "robots", content: "noindex, follow" }]
    : [],
}));

function onQuery(value: string) {
  noindex.value = value.length > 0;
}
</script>

<template>
  <div>
    <div class="hero-intro term-hero" :style="heroStyle">
      <h1 class="hero-intro__title">{{ page.title }}</h1>
    </div>
    <TermSearch
      :terms="page.terms"
      :sources="page.sources"
      :label="page.copy.label"
      :source-label="page.copy.sourceLabel"
      :all-label="page.allLabel"
      :empty-label="page.copy.empty"
      :pending-label="page.copy.pending"
      :status-default="page.copy.statusDefault"
      :status-results="page.copy.statusResults"
      :status-empty="page.copy.statusEmpty"
      :shown-label="page.copy.shown"
      :load-more-label="page.copy.loadMore"
      :clear-label="page.copy.clear"
      :expand-label="page.copy.expand"
      :collapse-label="page.copy.collapse"
      :definition-template="page.copy.definition"
      @query="onQuery"
    />
  </div>
</template>
