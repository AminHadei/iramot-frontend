<script setup lang="ts">
defineProps<{
  title: string;
  to?: string;
  linkLabel?: string;
}>();
</script>

<template>
  <div class="flex items-end justify-between gap-4 border-b border-line pb-4">
    <h2 class="font-heading text-3xl text-ink md:text-4xl">{{ title }}</h2>
    <NuxtLink
      v-if="to && linkLabel"
      :to="to"
      class="inline-flex items-center gap-2 text-sm text-primary"
    >
      {{ linkLabel }}
      <DirectionalIcon name="arrow" />
    </NuxtLink>
  </div>
</template>
