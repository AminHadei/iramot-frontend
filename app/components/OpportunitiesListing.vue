<script setup lang="ts">
import type { ListingView } from "~/composables/useArchiveListing";
import type { SiteContent } from "~/types/content";

defineProps<{
  listing: ListingView;
}>();

const { data: siteData } = await useSite();
const site = siteData.value as SiteContent | null;

function onFilter(event: Event) {
  const value = (event.target as HTMLSelectElement).value;
  if (value) void navigateTo(value);
}
</script>

<template>
  <div>
    <div class="hero-intro">
      <h1 class="hero-intro__title">{{ listing.title }}</h1>
      <div v-if="listing.description" class="hero-intro__body">
        <p>{{ listing.description }}</p>
      </div>
    </div>
    <div class="opportunities toc-layout">
      <div class="toc-layout__nav">
        <a class="toc-layout__nav-item" href="#opportunities">{{ listing.title }}</a>
      </div>
      <div class="opportunities__content toc-layout__content">
        <div id="opportunities" class="opportunities-posts">
          <h2 class="opportunities-posts__title">{{ listing.title }}</h2>
          <div
            v-if="listing.filters.length > 1"
            class="filter-toolbar filter-toolbar--loaded"
          >
            <div class="filter-toolbar__control filter-toolbar__control--no-js">
              <select
                class="filter-toolbar__button"
                :aria-label="listing.title"
                :value="listing.filters.find((filter) => filter.current)?.to"
                @change="onFilter"
              >
                <option
                  v-for="filter in listing.filters"
                  :key="filter.to"
                  :value="filter.to"
                >
                  {{ filter.label }}
                </option>
              </select>
            </div>
          </div>
          <div class="opportunities-posts__list">
            <p v-if="!listing.cards.length && site">{{ site.ui.emptyBody }}</p>
            <template v-for="card in listing.cards" :key="card.id">
              <a
                v-if="card.external"
                class="opportunities-posts__list-item"
                :href="card.external"
              >
                <div class="opportunities-posts__list-item-title">{{ card.title }}</div>
                <div v-if="site" class="opportunities-posts__list-item-cta">
                  {{ site.ui.more }}
                </div>
              </a>
              <NuxtLink
                v-else-if="card.to"
                class="opportunities-posts__list-item"
                :to="card.to"
              >
                <div class="opportunities-posts__list-item-title">{{ card.title }}</div>
                <div v-if="site" class="opportunities-posts__list-item-cta">
                  {{ site.ui.more }}
                </div>
              </NuxtLink>
            </template>
          </div>
          <PostPagination
            :previous="listing.previous"
            :next="listing.next"
            :previous-label="listing.previousLabel"
            :next-label="listing.nextLabel"
          />
        </div>
      </div>
    </div>
  </div>
</template>
