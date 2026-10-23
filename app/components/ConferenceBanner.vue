<script setup lang="ts">
import type { SiteContent } from "~/types/content";
import { withBase } from "~/utils/withBase";

const siteState = await useSite();
const site = computed(() => siteState.data.value as SiteContent);
const banner = useConferenceBanner();
const config = useRuntimeConfig();
const blendUrl = withBase(config.app.baseURL, "/images/hero-intro-blend-1.webp");

function externalUrl(url: string) {
  return url.startsWith("//") || /^[a-z][a-z\d+\-.]*:/i.test(url);
}

const NuxtLink = resolveComponent("NuxtLink");

const tag = computed(() => {
  const url = banner.value.ctaUrl;
  if (!banner.value.isLink || !url) return "div";
  return externalUrl(url) ? "a" : NuxtLink;
});

const bindings = computed(() => {
  const url = banner.value.ctaUrl;
  if (tag.value === "a" && url) {
    return { href: url, target: "_blank", rel: "noopener noreferrer" };
  }
  if (tag.value === NuxtLink && url) return { to: url };
  return {};
});

const heroClass = computed(() => {
  if (banner.value.state === "image") return "hero-intro hero-intro--image";
  if (banner.value.state === "tint") return "hero-intro hero-intro--tint";
  return "hero-intro";
});

const heroStyle = computed(() => {
  if (banner.value.state !== "image" || !banner.value.imageUrl) return undefined;
  return {
    "--hero-image": `url("${banner.value.imageUrl}")`,
    "--hero-blend": `url("${blendUrl}")`,
  };
});

const neutralLine = computed(() =>
  banner.value.state === "neutral" ? site.value?.ui.conferenceNeutral : null,
);
const showBody = computed(() =>
  Boolean(banner.value.dateLine || banner.value.place || neutralLine.value),
);
const showCta = computed(() => Boolean(banner.value.ctaLabel && banner.value.isLink));
</script>

<template>
  <component :is="tag" class="conference-banner" v-bind="bindings">
    <div :class="heroClass" :style="heroStyle">
      <h1 class="hero-intro__title">
        {{ banner.title ?? site.ui.conferenceTitle }}
      </h1>
      <div v-if="showBody" class="hero-intro__body">
        <p v-if="banner.dateLine">{{ banner.dateLine }}</p>
        <p v-if="banner.place">{{ banner.place }}</p>
        <p v-if="neutralLine">{{ neutralLine }}</p>
      </div>
      <div v-if="showCta" class="hero-intro__links">
        <span class="hero-intro__link--featured">{{ banner.ctaLabel }}</span>
      </div>
    </div>
  </component>
</template>
