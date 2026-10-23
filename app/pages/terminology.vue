<script setup lang="ts">
import type { SiteContent } from "~/types/content";
import { withBase } from "~/utils/withBase";

const siteState = useSite();
const repo = useTermRepository();
const route = useRoute();
const request = useRequestURL();
const baseURL = useRuntimeConfig().app.baseURL;
const noindex = ref(false);
const state = useAsyncData("terminology-page", async () => {
  const site = (await siteState).data.value as SiteContent | null;
  if (!site) return null;
  const [pagesFile, listed] = await Promise.all([
    queryCollection("archivePages").first(),
    repo.list(),
  ]);
  const record = archiveItems(pagesFile).find(
    (item) => item.id === site.pages.terminology,
  );
  if (!record) return null;
  return {
    title: site.listings.terminology.title,
    description: site.listings.terminology.description,
    copy: site.listings.terminology,
    allLabel: site.ui.all,
    sources: site.terminology.sources,
    groupTitle: record.title,
    html: articleHtml(record.content ?? "", baseURL).html.trim(),
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
    <div class="hero-intro">
      <h1 class="hero-intro__title">{{ page.title }}</h1>
      <div class="hero-intro__body">
        <p>{{ page.description }}</p>
      </div>
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
    <div v-if="page.html" class="half-content">
      <div class="half-content__body">
        <h2>{{ page.groupTitle }}</h2>
        <ArchiveHtml :html="page.html" />
      </div>
    </div>
  </div>
</template>
