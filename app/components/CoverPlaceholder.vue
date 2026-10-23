<script setup lang="ts">
import { withBase } from "~/utils/withBase";

defineProps<{
  title?: string;
}>();

const config = useRuntimeConfig();
const wave = `url("${withBase(config.app.baseURL, "/images/hero-intro-blend-1.webp")}")`;
</script>

<template>
  <span
    class="cover-placeholder"
    :class="{ 'cover-placeholder--titled': title }"
    :aria-hidden="title ? undefined : true"
  >
    <span
      class="cover-placeholder__wave"
      :style="{ backgroundImage: wave }"
      aria-hidden="true"
    />
    <span class="cover-placeholder__mark">
      <SiteMark placeholder />
    </span>
    <span v-if="title" class="cover-placeholder__title">{{ title }}</span>
  </span>
</template>
