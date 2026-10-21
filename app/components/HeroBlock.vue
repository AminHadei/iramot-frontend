<script setup lang="ts">
import type { ContentLink } from "~/types/content";

defineProps<{
  eyebrow: string;
  title: string;
  dek: string;
  links: ContentLink[];
}>();
</script>

<template>
  <section class="page-wrap pb-8 pt-16 md:pb-12 md:pt-28">
    <p class="text-sm text-secondary">{{ eyebrow }}</p>
    <h1
      class="mt-6 max-w-4xl font-heading text-4xl font-medium text-primary md:text-6xl"
    >
      {{ title }}
    </h1>
    <p class="mt-6 max-w-2xl text-lg leading-relaxed">{{ dek }}</p>
    <div class="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:gap-x-10">
      <NuxtLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="inline-flex items-center gap-2 text-primary"
      >
        {{ link.label }}
        <DirectionalIcon name="arrow" />
      </NuxtLink>
    </div>
  </section>
</template>
