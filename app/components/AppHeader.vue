<script setup lang="ts">
import type { SiteContent } from "~/types/content";

defineProps<{
  site: SiteContent;
}>();

const route = useRoute();
const menuOpen = ref(false);

function isCurrent(to: string) {
  if (to === "/") {
    return route.path === "/";
  }

  return route.path === to || route.path.startsWith(`${to}/`);
}

watch(
  () => route.path,
  () => {
    menuOpen.value = false;
  },
);
</script>

<template>
  <header class="border-b border-line bg-paper">
    <a
      href="#content"
      class="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:bg-paper focus:px-3 focus:py-2 focus:text-primary"
    >
      {{ site.ui.skip }}
    </a>
    <div class="page-inset flex items-center justify-between gap-4 py-4">
      <NuxtLink
        :to="'/'"
        class="inline-flex items-center gap-3"
        :aria-label="site.name"
      >
        <SiteMark />
        <span class="font-heading text-2xl text-primary">{{ site.shortName }}</span>
      </NuxtLink>

      <div class="hidden items-center gap-6 frame:flex">
        <nav :aria-label="site.ui.navigation">
          <ul class="flex items-center gap-5">
            <li v-for="item in site.nav" :key="item.to">
              <NuxtLink
                :to="item.to"
                class="text-sm"
                :class="isCurrent(item.to) ? 'text-primary' : 'text-ink'"
                :aria-current="isCurrent(item.to) ? 'page' : undefined"
              >
                {{ item.label }}
              </NuxtLink>
            </li>
          </ul>
        </nav>
        <NuxtLink
          :to="site.membership.to"
          class="border border-accent px-4 py-2 text-sm text-accent"
        >
          {{ site.membership.label }}
        </NuxtLink>
      </div>

      <button
        type="button"
        class="inline-flex size-11 items-center justify-center frame:hidden"
        :aria-expanded="menuOpen"
        aria-controls="mobile-nav"
        @click="menuOpen = !menuOpen"
      >
        <span class="sr-only">{{ menuOpen ? site.ui.close : site.ui.menu }}</span>
        <span v-if="!menuOpen" class="flex w-6 flex-col gap-1.5" aria-hidden="true">
          <span class="h-px bg-ink" />
          <span class="h-px bg-ink" />
          <span class="h-px bg-ink" />
        </span>
        <span v-else class="relative size-5" aria-hidden="true">
          <span
            class="absolute start-0 top-1/2 h-px w-full -translate-y-1/2 rotate-45 bg-ink"
          />
          <span
            class="absolute start-0 top-1/2 h-px w-full -translate-y-1/2 -rotate-45 bg-ink"
          />
        </span>
      </button>
    </div>

    <nav
      v-if="menuOpen"
      id="mobile-nav"
      class="border-t border-line frame:hidden"
      :aria-label="site.ui.navigation"
    >
      <ul class="page-inset py-2">
        <li v-for="item in site.nav" :key="item.to" class="border-b border-line">
          <NuxtLink
            :to="item.to"
            class="flex items-center justify-between py-4 font-heading text-2xl"
            :aria-current="isCurrent(item.to) ? 'page' : undefined"
          >
            {{ item.label }}
            <DirectionalIcon name="chevron" />
          </NuxtLink>
        </li>
        <li>
          <NuxtLink
            :to="site.membership.to"
            class="flex items-center justify-between py-4 font-heading text-2xl text-accent"
          >
            {{ site.membership.label }}
            <DirectionalIcon name="chevron" />
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </header>
</template>
