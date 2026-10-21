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
  <article class="border border-line bg-paper">
    <div class="relative border-b border-line">
      <div class="pt-[55.476%]" />
      <NuxtImg
        v-if="image"
        :src="image"
        :alt="title"
        provider="none"
        class="absolute inset-0 size-full object-cover"
      />
      <span
        v-else
        class="absolute inset-0 m-auto size-10 border border-line"
        aria-hidden="true"
      />
    </div>
    <div class="p-4">
      <h3
        class="font-heading text-[1.25rem] font-normal leading-snug wide:text-[1.375rem]"
      >
        <NuxtLink :to="to" class="text-accent">{{ title }}</NuxtLink>
      </h3>
      <p v-if="authors?.length" class="mt-2 text-sm text-secondary">
        {{ byLabel }} {{ formatAuthors(authors) }}
      </p>
      <p class="mt-3 text-sm font-light leading-relaxed">{{ description }}</p>
    </div>
  </article>
</template>
