<script setup lang="ts">
import type { SiteContent } from "~/types/content";

const siteState = useSite();
const state = useAsyncData("partners-page", async () => {
  const site = (await siteState).data.value as SiteContent | null;
  if (!site) return null;
  const record = archiveItems(await queryCollection("archivePages").first()).find(
    (item) => item.id === site.pages.partners,
  );
  if (!record) return null;
  return { title: record.title, empty: site.ui.emptyPartners };
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
  description: site.ui.emptyBody,
});
</script>

<template>
  <div>
    <HeroIntro :title="page.title" :dek="site.ui.emptyBody" />
    <section class="page-inset pb-16">
      <PersonCard class="max-w-sm" :empty-label="page.empty" />
    </section>
  </div>
</template>
