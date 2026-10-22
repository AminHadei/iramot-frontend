<script setup lang="ts">
import type { SiteContent } from "~/types/content";

const siteState = useSite();
const baseURL = useRuntimeConfig().app.baseURL;
const state = useAsyncData("terminology-page", async () => {
  const site = (await siteState).data.value as SiteContent | null;
  if (!site) return null;
  const [pagesFile, termsFile] = await Promise.all([
    queryCollection("archivePages").first(),
    queryCollection("archiveTerms").first(),
  ]);
  const record = archiveItems(pagesFile).find(
    (item) => item.id === site.pages.terminology,
  );
  if (!record) return null;
  const terms = archiveItems(termsFile)
    .filter((item) => item.title.length > 0)
    .map((item) => ({
      id: item.id,
      title: item.title,
      text: plainText(item.content ?? ""),
      sources: item.fields?.["word-category"] ?? [],
    }))
    .sort((left, right) => left.title.localeCompare(right.title, "en"));
  return {
    title: site.listings.terminology.title,
    description: site.listings.terminology.description,
    label: site.listings.terminology.label,
    empty: site.listings.terminology.empty,
    groupTitle: record.title,
    html: articleHtml(record.content ?? "", baseURL).html.trim(),
    terms,
    sources: site.terminology.sources,
    allLabel: site.ui.all,
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
  <div>
    <div class="hero-intro">
      <h1 class="hero-intro__title">{{ page.title }}</h1>
      <div class="hero-intro__body">
        <p>{{ page.description }}</p>
      </div>
    </div>
    <TermSearch
      :terms="page.terms"
      :label="page.label"
      :empty-label="page.empty"
      :sources="page.sources"
      :all-label="page.allLabel"
    />
    <div v-if="page.html" class="half-content">
      <div class="half-content__body">
        <h2>{{ page.groupTitle }}</h2>
        <ArchiveHtml :html="page.html" />
      </div>
    </div>
  </div>
</template>
