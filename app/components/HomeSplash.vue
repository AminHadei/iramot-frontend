<script setup lang="ts">
import type { ContentLink } from "~/types/content";

defineProps<{
  title: string;
  links: ContentLink[];
}>();
</script>

<template>
  <div class="home-contain home-contain--splash">
    <div class="home-splash">
      <div class="home-splash__video-wrap">
        <div class="home-splash__video home-splash__video--fallback" aria-hidden="true">
          <div class="splash-lines">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
        </div>
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

<style>
.splash-lines {
  position: absolute;
  inset: 0;
  overflow: hidden;
  color: var(--color-paper);
}

.splash-lines span {
  position: absolute;
  right: -10%;
  left: -10%;
  height: 1px;
  background: currentColor;
  opacity: 0.55;
  animation: splash-line 18s linear infinite;
}

.splash-lines span:nth-child(1) {
  top: 12%;
}

.splash-lines span:nth-child(2) {
  top: 28%;
  animation-duration: 22s;
  animation-delay: -6s;
}

.splash-lines span:nth-child(3) {
  top: 46%;
  animation-duration: 16s;
  animation-delay: -3s;
}

.splash-lines span:nth-child(4) {
  top: 63%;
  animation-duration: 24s;
  animation-delay: -11s;
}

.splash-lines span:nth-child(5) {
  top: 80%;
  animation-duration: 20s;
  animation-delay: -8s;
}

@keyframes splash-line {
  from {
    transform: translateY(30vh);
  }

  to {
    transform: translateY(-30vh);
  }
}

@media (prefers-reduced-motion: reduce) {
  .splash-lines span {
    animation: none;
  }
}
</style>
