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
    <section class="page-inset py-16">
      <h1 class="font-heading text-4xl font-medium text-primary wide:text-6xl">
        {{ page.title }}
      </h1>
      <p class="mt-6 max-w-2xl text-lg leading-relaxed">{{ page.description }}</p>
      <TermSearch
        class="mt-8"
        :terms="page.terms"
        :label="page.label"
        :empty-label="page.empty"
        :sources="page.sources"
        :all-label="page.allLabel"
      />
    </section>
    <section v-if="page.html" class="border-t border-line">
      <div class="page-inset py-16">
        <h2 class="font-heading text-3xl text-primary">{{ page.groupTitle }}</h2>
        <ArchiveHtml class="rich-text mt-6" :html="page.html" />
      </div>
    </section>
  </div>
</template>
