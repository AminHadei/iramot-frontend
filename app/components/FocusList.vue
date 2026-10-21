<script setup lang="ts">
import type { FocusArea } from "~/types/content";

defineProps<{
  areas: FocusArea[];
}>();
</script>

<template>
  <ul class="border-t border-line">
    <li v-for="area in areas" :key="area.title" class="border-b border-line">
      <NuxtLink
        :to="area.to"
        class="page-wrap group flex items-center justify-between gap-6 py-6 md:py-8"
      >
        <span
          class="flex min-w-0 flex-col gap-2 md:flex-row md:items-baseline md:gap-12"
        >
          <span class="shrink-0 text-sm text-secondary md:w-44">{{ area.title }}</span>
          <span
            class="font-heading text-2xl text-ink group-hover:text-primary md:text-3xl"
          >
            {{ area.question }}
          </span>
        </span>
        <DirectionalIcon name="chevron" />
      </NuxtLink>
    </li>
  </ul>
</template>
