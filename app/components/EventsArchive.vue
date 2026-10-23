<script setup lang="ts">
import { eventListingPath, eventTone, isEventProgram } from "~/data/events/programs";
import type { EventProgram } from "~/data/events/programs";
import type { EventList, EventSummary } from "~/data/events/types";
import type { SiteContent } from "~/types/content";

const props = defineProps<{
  archive: {
    title: string;
    description: string;
    site: SiteContent;
    page: number;
    program?: EventProgram;
    order: "asc" | "desc";
    list: EventList;
    featured: EventSummary | null;
    filters: SiteContent["eventFilters"];
  };
}>();

const tone = computed(() => eventTone(props.archive.program));
const cards = computed(() => props.archive.list.items);
const pageLabel = computed(() => {
  const pages = props.archive.list.pages;
  if (pages < 2) return "";
  return props.archive.site.ui.newsPage
    .replace("{current}", persianDigits(props.archive.page))
    .replace("{total}", persianDigits(pages));
});
const previous = computed(() =>
  props.archive.page > 1
    ? eventListingPath(
        props.archive.page - 1,
        props.archive.program,
        props.archive.order,
      )
    : undefined,
);
const next = computed(() =>
  props.archive.page < props.archive.list.pages
    ? eventListingPath(
        props.archive.page + 1,
        props.archive.program,
        props.archive.order,
      )
    : undefined,
);
const sortOptions = computed(() => [
  { value: "desc", label: props.archive.site.ui.newsNewest },
  { value: "asc", label: props.archive.site.ui.newsOldest },
]);

function tabTo(program?: EventProgram) {
  return eventListingPath(1, program, props.archive.order);
}

function programOf(path: string): EventProgram | undefined {
  const slug = path.replace("/events/", "");
  return isEventProgram(slug) ? slug : undefined;
}

function setOrder(value: string) {
  return navigateTo(
    eventListingPath(1, props.archive.program, value === "asc" ? "asc" : "desc"),
  );
}
</script>

<template>
  <div class="events-archive" :style="tone">
    <div class="category-header">
      <div class="category-header__inner">
        <div class="category-header__info">
          <h1 class="category-header__info-title">{{ archive.title }}</h1>
          <div v-if="archive.description" class="category-header__info-description">
            <p>{{ archive.description }}</p>
          </div>
        </div>
        <div v-if="archive.featured" class="category-header__latest">
          <EventCard featured :item="archive.featured" :site="archive.site" />
        </div>
      </div>
    </div>
    <div id="filter" class="post-listing-list post-listing-list--no-qty-columns">
      <div class="post-listing-list__toolbar">
        <div
          class="filter-toolbar filter-toolbar--category filter-toolbar--loaded event-toolbar"
        >
          <div class="event-tabs">
            <NuxtLink
              class="filter-toolbar__button"
              :class="{ 'filter-toolbar__button--active': !archive.program }"
              :to="tabTo()"
            >
              {{ archive.site.ui.all }}
            </NuxtLink>
            <NuxtLink
              v-for="filter in archive.filters"
              :key="filter.to"
              class="filter-toolbar__button"
              :class="{
                'filter-toolbar__button--active':
                  filter.to === `/events/${archive.program}`,
              }"
              :to="tabTo(programOf(filter.to))"
            >
              {{ filter.label }}
            </NuxtLink>
          </div>
          <ToolbarSelect
            class="toolbar-select--sort"
            :label="archive.site.ui.sort"
            :value="archive.order"
            :options="sortOptions"
            @select="setOrder"
          />
        </div>
      </div>
      <p
        v-if="!archive.featured && !cards.length"
        class="post-listing-list__no-results"
      >
        {{ archive.site.ui.eventEmpty }}
      </p>
      <div v-else-if="cards.length" class="post-listing-list__list event-grid">
        <EventCard
          v-for="item in cards"
          :key="item.id"
          :item="item"
          :site="archive.site"
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
