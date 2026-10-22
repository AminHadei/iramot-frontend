<script setup lang="ts">
import type { HomeContent, SiteContent } from "~/types/content";

defineProps<{
  site: SiteContent;
}>();

const route = useRoute();
const { data: home } = await useHomeChrome();

const page = computed(() => home.value as HomeContent | null);
const showNewsletter = computed(() => route.path === "/" && page.value);
</script>

<template>
  <NewsletterForm
    v-if="showNewsletter && page"
    :title="page.sections.newsletter"
    :label="page.newsletter.label"
    :submit="page.newsletter.submit"
    :note="page.newsletter.note"
  />
  <footer class="site-footer">
    <div class="site-footer__logo">
      <SiteMark />
    </div>
    <address class="site-footer__address">
      <template v-for="(line, index) in site.address" :key="line">
        {{ line }}<br v-if="index < site.address.length - 1" />
      </template>
    </address>
    <nav class="site-footer__main-menu" :aria-label="site.ui.siteMap">
      <ul class="menu">
        <li
          v-for="column in site.footerColumns"
          :key="column.title"
          class="menu-item menu-item-has-children"
        >
          <a href="#" @click.prevent>{{ column.title }}</a>
          <ul class="sub-menu">
            <li v-for="link in column.links" :key="link.to" class="menu-item">
              <NuxtLink :to="link.to">{{ link.label }}</NuxtLink>
            </li>
          </ul>
        </li>
      </ul>
    </nav>
    <div class="site-footer__copyright">{{ site.name }}</div>
  </footer>
</template>
