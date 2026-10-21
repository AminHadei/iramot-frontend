<script setup lang="ts">
defineProps<{
  previous?: string;
  next?: string;
  previousLabel: string;
  nextLabel: string;
}>();
</script>

<template>
  <nav v-if="previous || next" class="mt-10 flex gap-4">
    <NuxtLink
      v-if="previous"
      :to="previous"
      class="border border-line px-4 py-2 text-sm text-ink"
    >
      {{ previousLabel }}
    </NuxtLink>
    <NuxtLink
      v-if="next"
      :to="next"
      class="border border-line px-4 py-2 text-sm text-ink"
    >
      {{ nextLabel }}
    </NuxtLink>
  </nav>
</template>
