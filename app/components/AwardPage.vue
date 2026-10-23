<script setup lang="ts">
import type { NewsList, NewsSummary } from "~/data/news/types";
import type { AwardDocument } from "~/composables/useAwardPage";
import type { SiteContent } from "~/types/content";

const props = defineProps<{
  page: AwardDocument;
  site: SiteContent;
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
  props.listPage > 1 ? awardListingPath(props.listPage - 1, props.order) : undefined,
);
const next = computed(() =>
  props.listPage < props.list.pages
    ? awardListingPath(props.listPage + 1, props.order)
    : undefined,
);
const sortOptions = computed(() => [
  { value: "desc", label: props.site.ui.newsNewest },
  { value: "asc", label: props.site.ui.newsOldest },
]);

function setOrder(value: string) {
  return navigateTo(awardListingPath(1, value === "asc" ? "asc" : "desc"));
}
</script>

<template>
  <div>
    <div class="hero-intro">
      <h1 class="hero-intro__title">{{ page.title }}</h1>
      <div v-if="page.lead" class="hero-intro__body">
        <p>{{ page.lead }}</p>
      </div>
    </div>
    <div class="half-content">
      <div class="half-content__body">
        <ArchiveHtml :html="page.html" />
      </div>
    </div>
    <section class="award-news news-archive">
      <h2 class="news-related__title">{{ site.ui.awardNews }}</h2>
      <div v-if="featured" class="post-listing-list">
        <div class="post-listing-list__list">
          <NewsCard
            featured
            :item="featured"
            :link-label="site.ui.newsRead"
            :by-label="site.ui.newsAuthor"
            :featured-label="site.ui.latest"
            :topic-badge="site.ui.awardTopic"
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
            :topic-badge="site.ui.awardTopic"
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
