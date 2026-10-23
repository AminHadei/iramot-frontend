<script setup lang="ts">
import type { NewsSummary } from "~/data/news/types";
import { withBase } from "~/utils/withBase";

const props = defineProps<{
  item: NewsSummary;
  featured?: boolean;
  linkLabel: string;
  byLabel: string;
  featuredLabel?: string;
  categorySlug?: string;
}>();

const config = useRuntimeConfig();
const category = computed(() =>
  primaryNewsCategory(props.item.categories, props.categorySlug),
);
const tone = computed(() => {
  const color = newsCategoryColor(category.value?.slug ?? "news");
  if (props.item.image) return color;
  return {
    ...color,
    "--cover-wave": `url("${withBase(config.app.baseURL, "/images/hero-intro-blend-1.webp")}")`,
  };
});
const categoryTo = computed(() => newsCategoryPath(category.value?.slug));
const author = computed(() => props.item.author?.name || "");
</script>

<template>
  <div
    class="post-listing news-card"
    :class="{
      'post-listing--has-category post-listing--category-has-color': category,
      'post-listing--featured post-listing--featured-contain': featured,
      'news-card--blank': !item.image,
    }"
    :style="tone"
  >
    <NuxtLink
      class="post-listing__anchor"
      :to="`/news/${item.slug}`"
      :aria-label="item.title"
    />
    <NuxtLink v-if="category" class="post-listing__category" :to="categoryTo">
      <div class="post-listing__category-icon">
        <SiteMark />
      </div>
      <div class="post-listing__category-name">{{ category.name }}</div>
    </NuxtLink>
    <div class="post-listing__image">
      <img
        v-if="item.image"
        :src="item.image.url"
        :alt="item.image.alt"
        :width="item.image.width"
        :height="item.image.height"
      />
      <CoverPlaceholder v-else :title="featured ? undefined : category?.name" />
    </div>
    <div v-if="featured && item.date" class="post-listing__label">
      <span>{{ featuredLabel }}</span>
      <span class="post-listing__date">
        <PersianDate :date="item.date" />
      </span>
    </div>
    <div class="post-listing__content">
      <div class="post-listing__title">{{ item.title }}</div>
      <div v-if="item.excerpt" class="post-listing__excerpt">{{ item.excerpt }}</div>
      <div v-if="linkLabel" class="post-listing__link">{{ linkLabel }}</div>
      <div v-if="!featured && (item.date || author)" class="post-listing__meta">
        <div class="post-listing__info">
          <div v-if="item.date" class="post-listing__date">
            <PersianDate :date="item.date" />
          </div>
          <template v-if="author">
            <span v-if="item.date">&nbsp;&nbsp;/&nbsp;&nbsp;</span>
            <div class="author-list">
              <span>{{ byLabel + "\u00a0" }}</span>
              <span class="author-list__author">
                <span>{{ author }}</span>
              </span>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
