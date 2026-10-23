<script setup lang="ts">
import type { NewsCategory, NewsList } from "~/data/news/types";
import type { SiteContent } from "~/types/content";

const props = defineProps<{
  archive: {
    title: string;
    description: string;
    site: SiteContent;
    page: number;
    category?: string;
    order: "asc" | "desc";
    list: NewsList;
    filters: NewsCategory[];
  };
}>();

const featured = computed(() => props.archive.list.items[0]);
const cards = computed(() => props.archive.list.items.slice(1));
const pageLabel = computed(() => {
  const pages = props.archive.list.pages;
  if (pages < 2) return "";
  return props.archive.site.ui.newsPage
    .replace("{current}", persianDigits(props.archive.page))
    .replace("{total}", persianDigits(pages));
});
const previous = computed(() =>
  props.archive.page > 1
    ? newsListingPath(
        props.archive.page - 1,
        props.archive.category,
        props.archive.order,
      )
    : undefined,
);
const next = computed(() =>
  props.archive.page < props.archive.list.pages
    ? newsListingPath(
        props.archive.page + 1,
        props.archive.category,
        props.archive.order,
      )
    : undefined,
);
const sortOptions = computed(() => [
  { value: "desc", label: props.archive.site.ui.newsNewest },
  { value: "asc", label: props.archive.site.ui.newsOldest },
]);
const categoryOptions = computed(() => [
  { value: "", label: props.archive.site.ui.newsAll },
  ...props.archive.filters.map((filter) => ({
    value: filter.slug,
    label: filter.name,
  })),
]);

function setOrder(value: string) {
  return navigateTo(
    newsListingPath(1, props.archive.category, value === "asc" ? "asc" : "desc"),
  );
}

function setCategory(value: string) {
  return navigateTo(newsListingPath(1, value || undefined, props.archive.order));
}
</script>

<template>
  <div class="news-archive">
    <div v-if="featured" class="post-listing-list">
      <div class="post-listing-list__list">
        <NewsCard
          featured
          :item="featured"
          :link-label="archive.site.ui.newsRead"
          :by-label="archive.site.ui.newsAuthor"
          :featured-label="archive.site.ui.latest"
        />
      </div>
    </div>
    <div id="filter" class="post-listing-list">
      <div class="post-listing-list__toolbar">
        <div class="filter-toolbar filter-toolbar--category filter-toolbar--loaded">
          <ToolbarSelect
            class="toolbar-select--sort"
            :label="archive.site.ui.sort"
            :value="archive.order"
            :options="sortOptions"
            @select="setOrder"
          />
          <ToolbarSelect
            :label="archive.site.ui.newsCategory"
            :value="archive.category ?? ''"
            :options="categoryOptions"
            @select="setCategory"
          />
        </div>
      </div>
      <p v-if="!archive.list.items.length" class="post-listing-list__no-results">
        {{ archive.site.ui.newsEmpty }}
      </p>
      <div v-else-if="cards.length" class="post-listing-list__list">
        <NewsCard
          v-for="item in cards"
          :key="item.id"
          :item="item"
          :link-label="archive.site.ui.newsRead"
          :by-label="archive.site.ui.newsAuthor"
        />
      </div>
      <PostPagination
        v-if="pageLabel"
        :previous="previous"
        :next="next"
        :previous-label="archive.site.ui.previous"
        :next-label="archive.site.ui.next"
        :page-label="pageLabel"
      />
    </div>
  </div>
</template>
