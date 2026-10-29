<script setup lang="ts">
import { sanitizePublicHtml } from "~/utils/sanitizeHtml";

const props = defineProps<{
  html: string;
}>();

const safe = computed(() => sanitizePublicHtml(props.html));
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div v-html="safe" />
</template>
