<script setup lang="ts">
defineProps<{
  tone?: "paper";
}>();
</script>

<template>
  <svg
    viewBox="0 0 32 32"
    class="shrink-0"
    :class="
      tone === 'paper' ? 'size-5 text-paper frame:size-[38px]' : 'size-8 text-primary'
    "
    aria-hidden="true"
  >
    <rect
      x="1.5"
      y="1.5"
      width="29"
      height="29"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
    />
    <rect x="7" y="7" width="7" height="18" fill="currentColor" />
    <rect class="fill-secondary" x="18" y="7" width="7" height="11" />
  </svg>
</template>
