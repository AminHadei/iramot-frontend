<script setup lang="ts">
import type { SiteContent } from "~/types/content";

defineProps<{
  site: SiteContent;
}>();
</script>

<template>
  <footer class="full-band full-band-line relative mt-[30px] text-paper">
    <div
      class="page-inset grid gap-y-2 py-8 frame:grid-cols-[auto_1fr] frame:gap-x-10 frame:py-10"
    >
      <div class="frame:row-span-2">
        <SiteMark tone="paper" />
      </div>
      <nav class="frame:row-span-3" :aria-label="site.ui.siteMap">
        <ul class="grid gap-8 pt-6 frame:grid-cols-4 frame:pt-0">
          <li v-for="column in site.footerColumns" :key="column.title">
            <p class="text-[0.6875rem] font-bold wide:text-[0.8125rem]">
              {{ column.title }}
            </p>
            <ul class="mt-3 space-y-2">
              <li v-for="link in column.links" :key="link.to">
                <NuxtLink
                  :to="link.to"
                  class="text-[0.6875rem] font-light hover:text-secondary-soft wide:text-[0.8125rem]"
                >
                  {{ link.label }}
                </NuxtLink>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
      <address
        class="pt-4 text-[0.6875rem] font-light not-italic wide:text-[0.8125rem] frame:pt-0"
      >
        <p v-for="line in site.address" :key="line">{{ line }}</p>
      </address>
      <p class="text-[0.6875rem] font-light wide:text-[0.8125rem]">
        {{ site.name }}
      </p>
    </div>
  </footer>
</template>
