<script setup lang="ts">
import type { SiteContent } from "~/types/content";

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

const singlePost = computed(() => {
  const path = route.path.replace(/\/+$/, "") || "/";
  if (!path.startsWith("/news/")) return false;
  const parts = path.split("/").filter(Boolean);
  return parts.length === 2 && parts[1] !== "page" && parts[1] !== "category";
});

function isCurrent(to: string) {
  const path = (to.split("#")[0] ?? to).replace(/\/+$/, "") || "/";
  const current = route.path.replace(/\/+$/, "") || "/";
  if (path === "/") return current === "/";
  return current === path || current.startsWith(`${path}/`);
}

function setOpen(next: boolean) {
  open.value = next;
  if (!next) panel.value = null;
  document.body.classList.toggle("nav-open", next);
}

watch(
  () => route.fullPath,
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
              <svg
                class="rtl:-scale-x-100"
                width="24"
                height="16"
                viewBox="0 0 24 16"
                fill="none"
              >
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
    </ul>
  </div>
  <header
    class="site-header"
    :class="{
      'site-header--opaque': opaque,
    }"
  >
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
        <SiteMark v-if="singlePost" variant="stacked" />
        <NuxtImg
          v-else
          src="/brand/logo-horizontal.webp"
          alt=""
          width="361"
          height="92"
          provider="none"
        />
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
