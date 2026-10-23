<script setup lang="ts">
import type { NewsList, NewsSummary } from "~/data/news/types";
import type { SiteContent } from "~/types/content";

const props = defineProps<{
  site: SiteContent;
  intro: string | null;
  listPage: number;
  order: "asc" | "desc";
  list: NewsList;
  featured: NewsSummary | null;
}>();

const cards = computed(() => props.list.items);
const pageLabel = computed(() => {
  const pages = props.list.pages;
  if (pages < 2) return "";
  return props.site.ui.newsPage
    .replace("{current}", persianDigits(props.listPage))
    .replace("{total}", persianDigits(pages));
});
const previous = computed(() =>
  props.listPage > 1
    ? conferenceListingPath(props.listPage - 1, props.order)
    : undefined,
);
const next = computed(() =>
  props.listPage < props.list.pages
    ? conferenceListingPath(props.listPage + 1, props.order)
    : undefined,
);
const sortOptions = computed(() => [
  { value: "desc", label: props.site.ui.newsNewest },
  { value: "asc", label: props.site.ui.newsOldest },
]);

function setOrder(value: string) {
  return navigateTo(conferenceListingPath(1, value === "asc" ? "asc" : "desc"));
}
</script>

<template>
  <div>
    <ConferenceBanner />
    <div v-if="intro" class="half-content">
      <div class="half-content__body">
        <p>{{ intro }}</p>
      </div>
    </div>
    <section class="conference-news news-archive" aria-labelledby="conference-news">
      <h2 id="conference-news" class="news-related__title">
        {{ site.ui.conferenceNews }}
      </h2>
      <div v-if="listPage === 1 && featured" class="post-listing-list">
        <div class="post-listing-list__list">
          <NewsCard
            featured
            :item="featured"
            :link-label="site.ui.newsRead"
            :by-label="site.ui.newsAuthor"
            :featured-label="site.ui.latest"
          />
        </div>
      </div>
      <div id="filter" class="post-listing-list">
        <div class="post-listing-list__toolbar">
          <div class="filter-toolbar filter-toolbar--category filter-toolbar--loaded">
            <ToolbarSelect
              class="toolbar-select--sort"
              :label="site.ui.sort"
              :value="order"
              :options="sortOptions"
              @select="setOrder"
            />
          </div>
        </div>
        <p v-if="!featured && !list.items.length" class="post-listing-list__no-results">
          {{ site.ui.newsEmpty }}
        </p>
        <div v-else-if="cards.length" class="post-listing-list__list">
          <NewsCard
            v-for="item in cards"
            :key="item.id"
            :item="item"
            :link-label="site.ui.newsRead"
            :by-label="site.ui.newsAuthor"
          />
        </div>
        <PostPagination
          v-if="pageLabel"
          :previous="previous"
          :next="next"
          :previous-label="site.ui.previous"
          :next-label="site.ui.next"
          :page-label="pageLabel"
        />
      </div>
    </section>
  </div>
</template>
