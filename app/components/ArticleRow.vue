<script setup lang="ts">
import type { ArticleFields } from "~/types/content";

defineProps<{
  article: ArticleFields;
  byLabel: string;
  large?: boolean;
}>();
</script>

<template>
  <article class="border-b border-line py-8">
    <div class="flex flex-col gap-6 md:flex-row md:items-start">
      <NuxtImg
        v-if="article.image"
        :src="article.image"
        :alt="article.title"
        provider="none"
        class="aspect-[3/2] w-full object-cover md:w-64 md:shrink-0"
      />
      <div class="min-w-0">
        <p v-if="article.category" class="text-sm text-secondary">
          {{ article.category }}
        </p>
        <h3
          class="mt-2 font-heading text-ink"
          :class="large ? 'text-3xl md:text-5xl' : 'text-2xl md:text-3xl'"
        >
          <NuxtLink :to="article.path" class="hover:text-primary">
            {{ article.title }}
          </NuxtLink>
        </h3>
        <p class="mt-3 max-w-3xl text-lg leading-relaxed">{{ article.description }}</p>
        <p class="mt-4 text-sm">
          <PersianDate v-if="article.date" :date="article.date" />
          <span v-if="article.authors?.length">
            <span v-if="article.date"> · </span>
            {{ byLabel }} {{ formatAuthors(article.authors) }}
          </span>
        </p>
      </div>
    </div>
  </article>
</template>
