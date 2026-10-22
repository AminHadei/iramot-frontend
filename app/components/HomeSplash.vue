<script setup lang="ts">
import type { ContentLink } from "~/types/content";

defineProps<{
  title: string;
  links: ContentLink[];
}>();

const stage = ref<HTMLElement | null>(null);
let animation: { destroy: () => void } | undefined;

onMounted(async () => {
  const node = stage.value;
  if (!node) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lottie = (await import("lottie-web")).default;
  const base = useRuntimeConfig().app.baseURL;
  const prefix = base.endsWith("/") ? base : `${base}/`;
  const player = lottie.loadAnimation({
    container: node,
    renderer: "svg",
    loop: !reduce,
    autoplay: !reduce,
    path: `${prefix}animations/splash.json`,
    rendererSettings: { preserveAspectRatio: "xMidYMid slice" },
  });
  animation = player;
  if (reduce) {
    player.addEventListener("DOMLoaded", () => {
      player.goToAndStop(0, true);
    });
  }
});

onBeforeUnmount(() => {
  animation?.destroy();
});
</script>

<template>
  <div class="home-contain home-contain--splash">
    <div class="home-splash">
      <div class="home-splash__video-wrap">
        <div ref="stage" class="home-splash__video home-splash__video--visible" />
      </div>
      <h2 class="home-splash__title">{{ title }}</h2>
      <div class="home-splash__links">
        <NuxtLink v-for="link in links" :key="link.to" :to="link.to">
          {{ link.label }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
