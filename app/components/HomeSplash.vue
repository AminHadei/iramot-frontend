<script setup lang="ts">
import type { ContentLink } from "~/types/content";

defineProps<{
  title: string;
  links: ContentLink[];
}>();
</script>

<template>
  <section class="full-band full-band-primary text-paper">
    <div class="page-inset grid gap-5 pb-[60px] pt-16">
      <h1
        class="max-w-[915px] font-heading text-[2rem] font-bold leading-none wide:text-[3.5rem]"
      >
        {{ title }}
      </h1>
      <ul class="flex flex-wrap gap-x-8 gap-y-3">
        <li v-for="link in links" :key="link.to">
          <NuxtLink :to="link.to" class="inline-flex items-center gap-2 text-sm">
            {{ link.label }}
            <DirectionalIcon name="arrow" />
          </NuxtLink>
        </li>
      </ul>
    </div>
  </section>
</template>
