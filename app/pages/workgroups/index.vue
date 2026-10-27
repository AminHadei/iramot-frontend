<script setup lang="ts">
import { workgroupTone } from "~/data/workgroups/tone";
import type { SiteContent } from "~/types/content";
import { plainText } from "~/utils/plainText";
import { looksLikeHtml } from "~/utils/richText";
import { sanitizePublicHtml } from "~/utils/sanitizeHtml";

const siteState = useSite();
const listState = useWorkgroupList();
const siteData = await siteState;
const listData = await listState;
const site = siteData.data.value as SiteContent | null;
const list = listData.data.value;

if (!site || !list) {
  throw createError({ statusCode: 404, statusMessage: site?.ui.notFound });
}

usePageSeo({
  title: list.title,
  description: plainText(list.description),
});
</script>

<template>
  <div class="wg-index">
    <div class="hero-intro hero-intro--compact">
      <h1 class="hero-intro__title">{{ list.title }}</h1>
      <div class="hero-intro__body">
        <!-- eslint-disable vue/no-v-html -->
        <div
          v-if="looksLikeHtml(list.description)"
          v-html="sanitizePublicHtml(list.description)"
        />
        <!-- eslint-enable vue/no-v-html -->
        <p v-else>{{ list.description }}</p>
      </div>
    </div>
    <div class="post-listing-list wg-list">
      <div class="post-listing-list__list wg-grid">
        <article
          v-for="item in list.groups"
          :key="item.slug"
          class="post-listing news-card wg-card"
          :style="workgroupTone(item.colorIndex)"
        >
          <NuxtLink
            class="post-listing__anchor"
            :to="`/workgroups/${item.slug}`"
            :aria-label="`${site.ui.workgroupView} ${item.title}`"
          />
          <div class="post-listing__image wg-card__block">
            <h2 class="post-listing__title wg-card__title">{{ item.title }}</h2>
            <div v-if="item.manager" class="wg-card__manager">
              <NuxtImg
                v-if="item.manager.photo"
                class="wg-card__avatar"
                :src="item.manager.photo"
                alt=""
                width="96"
                height="96"
                provider="none"
              />
              <span>{{ site.ui.workgroupManager }}: {{ item.manager.name }}</span>
            </div>
          </div>
          <div class="post-listing__content wg-card__content">
            <p v-if="item.excerpt" class="post-listing__excerpt">{{ item.excerpt }}</p>
            <span class="post-listing__link wg-card__more">{{
              site.ui.workgroupView
            }}</span>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>
