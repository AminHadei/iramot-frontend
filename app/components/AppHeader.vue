<script setup lang="ts">
import type { HomeContent, SiteContent } from "~/types/content";

defineProps<{
  site: SiteContent;
}>();

const route = useRoute();
const open = ref(false);
const panel = ref<string | null>(null);
const opaque = ref(false);

function syncOpaque() {
  opaque.value = window.scrollY > 0;
}

const { data: home } = await useHomeChrome();

const searchLabel = computed(
  () => (home.value as HomeContent | null)?.search.label ?? "",
);

function isCurrent(to: string) {
  const path = to.split("#")[0] ?? to;
  if (path === "/") return route.path === "/";
  return route.path === path || route.path.startsWith(`${path}/`);
}

function setOpen(next: boolean) {
  open.value = next;
  if (!next) panel.value = null;
  document.body.classList.toggle("nav-open", next);
}

function goTerminology() {
  setOpen(false);
  void navigateTo("/terminology");
}

watch(
  () => route.path,
  () => {
    if (!open.value) return;
    setOpen(false);
  },
);

onMounted(() => {
  syncOpaque();
  window.addEventListener("scroll", syncOpaque, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", syncOpaque);
  document.body.classList.remove("nav-open");
});
</script>

<template>
  <div class="site-navigation" :aria-hidden="open ? undefined : true">
    <ul class="site-nav">
      <li
        v-for="item in site.nav"
        :key="item.to"
        class="menu-item"
        :class="item.children?.length ? 'menu-item-has-children' : ''"
      >
        <a
          v-if="item.children?.length"
          :href="item.to"
          @click.prevent="panel = item.to"
        >
          {{ item.label }}
        </a>
        <NuxtLink
          v-else
          :to="item.to"
          :aria-current="isCurrent(item.to) ? 'page' : undefined"
        >
          {{ item.label }}
        </NuxtLink>
        <ul
          v-if="item.children?.length"
          class="sub-menu"
          :class="panel === item.to ? 'active' : ''"
        >
          <li class="header-item" @click="panel = null">
            <div class="arrow" aria-hidden="true">
              <svg width="24" height="16" viewBox="0 0 24 16" fill="none">
                <path
                  d="M8 1.5 1.5 8 8 14.5M2 8h21"
                  stroke="currentColor"
                  stroke-width="1.5"
                />
              </svg>
            </div>
            <div class="title">{{ item.label }}</div>
          </li>
          <li class="menu-item all-item">
            <NuxtLink :to="item.to">{{ item.label }}</NuxtLink>
          </li>
          <li v-for="child in item.children" :key="child.to" class="menu-item">
            <NuxtLink :to="child.to">{{ child.label }}</NuxtLink>
          </li>
        </ul>
      </li>
      <li class="menu-search menu-item">
        <a href="/terminology" @click.prevent="panel = 'search'">{{ searchLabel }}</a>
        <ul class="sub-menu" :class="panel === 'search' ? 'active' : ''">
          <li class="header-item" @click="panel = null">
            <div class="arrow" aria-hidden="true">
              <svg width="24" height="16" viewBox="0 0 24 16" fill="none">
                <path
                  d="M8 1.5 1.5 8 8 14.5M2 8h21"
                  stroke="currentColor"
                  stroke-width="1.5"
                />
              </svg>
            </div>
            <div class="title">{{ searchLabel }}</div>
          </li>
          <li class="menu-search-li">
            <form class="menu-search-form" @submit.prevent="goTerminology">
              <input
                type="text"
                name="s"
                :placeholder="searchLabel"
                :aria-label="searchLabel"
              />
              <button type="submit" class="menu-search-submit">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 15 15"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M13.125 13.125 10.406 10.406M11.875 6.875a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                  />
                </svg>
                {{ searchLabel }}
              </button>
            </form>
          </li>
        </ul>
      </li>
    </ul>
  </div>
  <header class="site-header" :class="{ 'site-header--opaque': opaque }">
    <a
      href="#content"
      class="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50"
    >
      {{ site.ui.skip }}
    </a>
    <div class="site-header__inner">
      <NuxtLink
        to="/"
        class="site-header__logo"
        :aria-label="site.name"
        :title="site.name"
      >
        <SiteMark />
        <span class="site-header__logo-name">{{ site.name }}</span>
      </NuxtLink>
      <button
        type="button"
        class="site-header__nav-toggle nav-toggle"
        :aria-expanded="open"
        :aria-label="open ? site.ui.close : site.ui.menu"
        @click="setOpen(!open)"
      >
        <svg width="25" height="19" viewBox="0 0 25 19" aria-hidden="true">
          <path fill="var(--logo-color, #373737)" d="M0 0h25v1H0z" />
          <path fill="var(--logo-color, #373737)" d="M0 6h25v1H0z" />
          <path fill="var(--logo-color, #373737)" d="M0 12h25v1H0z" />
          <path fill="var(--logo-color, #373737)" d="M0 18h25v1H0z" />
        </svg>
        <svg width="23" height="23" viewBox="0 0 23 23" aria-hidden="true">
          <path fill="var(--logo-color, #373737)" d="M20 19.3 3 2.3l-.7.7L19.3 20z" />
          <path fill="var(--logo-color, #373737)" d="M19.3 2.3 2.3 19.3l.7.7L20 3z" />
        </svg>
      </button>
      <form class="site-header__search" @submit.prevent="goTerminology">
        <input
          name="s"
          type="text"
          class="site-header__search-input"
          :aria-label="searchLabel"
          :placeholder="searchLabel"
        />
        <button class="site-header__search-submit" type="submit">
          <svg
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M13.125 13.125 10.406 10.406M11.875 6.875a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
          <span>{{ searchLabel }}</span>
        </button>
      </form>
      <nav class="site-header__nav" :aria-label="site.ui.navigation">
        <ul class="site-nav">
          <li
            v-for="item in site.nav"
            :key="item.to"
            class="menu-item"
            :class="item.children?.length ? 'menu-item-has-children' : ''"
          >
            <NuxtLink
              :to="item.to"
              :aria-current="isCurrent(item.to) ? 'page' : undefined"
            >
              {{ item.label }}
            </NuxtLink>
            <ul v-if="item.children?.length" class="sub-menu">
              <li class="menu-item all-item">
                <NuxtLink :to="item.to">{{ item.label }}</NuxtLink>
              </li>
              <li v-for="child in item.children" :key="child.to" class="menu-item">
                <NuxtLink :to="child.to">{{ child.label }}</NuxtLink>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>
