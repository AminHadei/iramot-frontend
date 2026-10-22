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
    <div class="hero-intro">
      <h1 class="hero-intro__title">{{ page.title }}</h1>
      <div class="hero-intro__body">
        <p>{{ site.ui.emptyBody }}</p>
      </div>
    </div>
    <div class="people-group-list">
      <div class="people-group-list__wrapper">
        <div
          v-for="mode in ['desktop', 'mobile']"
          :key="mode"
          class="people-group-list__group people-group"
          :class="`people-group--${mode}`"
        >
          <h2 class="people-group__title">{{ page.title }}</h2>
          <div class="people-group__description">{{ page.empty }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
