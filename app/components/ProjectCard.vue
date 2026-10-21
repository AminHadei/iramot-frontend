<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
  to: string;
  authors?: string[];
  byLabel: string;
  image?: string;
}>();
</script>

<template>
  <article class="border-t border-line pt-6">
    <NuxtImg
      v-if="image"
      :src="image"
      :alt="title"
      provider="none"
      class="mb-5 aspect-[3/2] w-full object-cover"
    />
    <h3 class="font-heading text-2xl text-ink">
      <NuxtLink :to="to" class="hover:text-primary">{{ title }}</NuxtLink>
    </h3>
    <p v-if="authors?.length" class="mt-2 text-sm text-secondary">
      {{ byLabel }} {{ formatAuthors(authors) }}
    </p>
    <p class="mt-4 leading-relaxed">{{ description }}</p>
  </article>
</template>
