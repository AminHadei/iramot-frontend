<script setup lang="ts">
import type { ListingCard } from "~/utils/archive";

defineProps<{
  title: string;
  description?: string;
  filters: Array<{ label: string; to: string; current: boolean }>;
  cards: ListingCard[];
  previous?: string;
  next?: string;
  previousLabel: string;
  nextLabel: string;
}>();
</script>

<template>
  <section class="page-inset py-16">
    <h1 class="font-heading text-4xl font-medium text-primary wide:text-6xl">
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
