<script setup lang="ts">
import type { ListingCard } from "~/utils/archive";

const props = defineProps<{
  title?: string;
  description?: string;
  filters: Array<{ label: string; to: string; current: boolean }>;
  cards: ListingCard[];
  previous?: string;
  next?: string;
  previousLabel: string;
  nextLabel: string;
  shell?: "archive" | "category";
}>();

const lead = computed(() => (props.shell ? props.cards[0] : undefined));
const listCards = computed(() => (props.shell ? props.cards.slice(1) : props.cards));

function onFilter(event: Event) {
  const value = (event.target as HTMLSelectElement).value;
  if (value) void navigateTo(value);
}
</script>

<template>
  <div v-if="shell">
    <div v-if="shell === 'category'" class="category-header" :style="categoryColor(0)">
      <div class="category-header__inner">
        <div class="category-header__info">
          <h1 class="category-header__info-title">{{ title }}</h1>
          <div v-if="description" class="category-header__info-description">
            <p>{{ description }}</p>
          </div>
        </div>
        <div v-if="lead" class="category-header__latest">
          <div
            class="category-header__latest-post category-header__latest-post--mobile"
          >
            <PostListing
              :title="lead.title"
              :to="lead.to"
              :external="lead.external"
              :excerpt="lead.excerpt"
              :category="lead.category"
              :date="lead.date"
              :image="lead.image"
            />
          </div>
          <div
            class="category-header__latest-post category-header__latest-post--desktop"
          >
            <PostListing
              featured="full"
              :title="lead.title"
              :to="lead.to"
              :external="lead.external"
              :excerpt="lead.excerpt"
              :category="lead.category"
              :date="lead.date"
              :image="lead.image"
            />
          </div>
        </div>
      </div>
    </div>
    <div v-if="shell === 'category' && lead?.html" class="half-content">
      <div class="half-content__body">
        <ArchiveHtml :html="lead.html" />
      </div>
    </div>
    <div v-if="shell === 'archive' && title" class="hero-intro">
      <h1 class="hero-intro__title">{{ title }}</h1>
      <div v-if="description" class="hero-intro__body">
        <p>{{ description }}</p>
      </div>
    </div>
    <div v-if="shell === 'archive' && lead" class="post-listing-list">
      <div class="post-listing-list__list">
        <PostListing
          featured="contain"
          :title="lead.title"
          :to="lead.to"
          :external="lead.external"
          :excerpt="lead.excerpt"
          :category="lead.category"
          :date="lead.date"
          :image="lead.image"
        >
          <ArchiveHtml v-if="lead.html" class="half-content__body" :html="lead.html" />
        </PostListing>
      </div>
    </div>
    <div id="filter" class="post-listing-list">
      <div v-if="filters.length > 1" class="post-listing-list__toolbar">
        <div class="filter-toolbar filter-toolbar--loaded">
          <div class="filter-toolbar__control filter-toolbar__control--no-js">
            <select
              class="filter-toolbar__button"
              :aria-label="title"
              :value="filters.find((filter) => filter.current)?.to"
              @change="onFilter"
            >
              <option v-for="filter in filters" :key="filter.to" :value="filter.to">
                {{ filter.label }}
              </option>
            </select>
          </div>
        </div>
      </div>
      <div v-if="listCards.length" class="post-listing-list__list">
        <PostListing
          v-for="card in listCards"
          :key="card.id"
          :title="card.title"
          :to="card.to"
          :external="card.external"
          :excerpt="card.excerpt"
          :category="card.category"
          :date="card.date"
          :image="card.image"
        >
          <ArchiveHtml v-if="card.html" class="half-content__body" :html="card.html" />
        </PostListing>
      </div>
      <PostPagination
        :previous="previous"
        :next="next"
        :previous-label="previousLabel"
        :next-label="nextLabel"
      />
    </div>
  </div>
  <section v-else class="page-inset py-16">
    <h1
      v-if="title"
      class="font-heading text-4xl font-medium text-primary wide:text-6xl"
    >
      {{ title }}
    </h1>
    <p v-if="description" class="mt-6 max-w-2xl text-lg leading-relaxed">
      {{ description }}
    </p>
    <CategoryFilter class="mt-8" :filters="filters" />
    <div class="mt-10 grid gap-5 wide:grid-cols-3">
      <div
        v-for="card in cards"
        :key="card.id"
        :class="card.html ? 'wide:col-span-3' : ''"
      >
        <PostListing
          :title="card.title"
          :to="card.to"
          :external="card.external"
          :excerpt="card.excerpt"
          :category="card.category"
          :date="card.date"
          :image="card.image"
        />
        <ArchiveHtml v-if="card.html" class="rich-text mt-4" :html="card.html" />
      </div>
    </div>
    <ListPager
      :previous="previous"
      :next="next"
      :previous-label="previousLabel"
      :next-label="nextLabel"
    />
  </section>
</template>
