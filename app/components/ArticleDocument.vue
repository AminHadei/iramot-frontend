<script setup lang="ts">
defineProps<{
  title: string;
  description?: string;
  date?: string;
  category?: string;
  authors?: string[];
  image?: string;
  byLabel: string;
  doc: object;
}>();
</script>

<template>
  <article class="page-wrap py-16 md:py-20">
    <p v-if="category" class="text-sm text-secondary">{{ category }}</p>
    <h1
      class="mt-4 max-w-4xl font-heading text-4xl font-medium text-primary md:text-6xl"
    >
      {{ title }}
    </h1>
    <p v-if="description" class="mt-6 max-w-2xl text-lg leading-relaxed">
      {{ description }}
    </p>
    <p class="mt-6 text-sm">
      <PersianDate v-if="date" :date="date" />
      <span v-if="authors?.length">
        <span v-if="date"> · </span>
        {{ byLabel }} {{ formatAuthors(authors) }}
      </span>
    </p>
    <NuxtImg
      v-if="image"
      :src="image"
      :alt="title"
      provider="none"
      class="mt-10 aspect-[16/9] w-full max-w-4xl object-cover"
    />
    <div class="rich-text mt-10 max-w-3xl">
      <ContentRenderer :value="doc" />
    </div>
  </article>
</template>
