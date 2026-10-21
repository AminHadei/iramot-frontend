<script setup lang="ts">
defineProps<{
  name: "arrow" | "chevron";
}>();
</script>

<template>
  <svg
    viewBox="0 0 24 24"
    class="inline-block size-4 shrink-0 rtl:-scale-x-100"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    aria-hidden="true"
  >
    <path
      v-if="name === 'arrow'"
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M5 12h14M13 6l6 6-6 6"
    />
    <path v-else stroke-linecap="round" stroke-linejoin="round" d="M9 6l6 6-6 6" />
  </svg>
</template>
