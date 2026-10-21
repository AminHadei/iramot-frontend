<script setup lang="ts">
import type { SiteContent } from "~/types/content";

defineProps<{
  site: SiteContent;
}>();
</script>

<template>
  <footer class="border-t border-line">
    <div class="page-wrap grid gap-10 py-14 md:grid-cols-4">
      <div class="md:col-span-1">
        <p class="font-heading text-2xl leading-snug text-primary">{{ site.name }}</p>
        <p class="mt-4 text-sm leading-relaxed">{{ site.description }}</p>
      </div>
      <div v-for="column in site.footerColumns" :key="column.title">
        <h2 class="text-sm text-secondary">{{ column.title }}</h2>
        <ul class="mt-4 space-y-2">
          <li v-for="link in column.links" :key="link.to">
            <NuxtLink :to="link.to" class="text-sm hover:text-primary">
              {{ link.label }}
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>
  </footer>
</template>
