<script setup lang="ts">
defineProps<{
  label: string;
  value: string;
}>();
</script>

<template>
  <div class="grid gap-1">
    <p class="text-sm text-secondary">{{ label }}</p>
    <p class="border-b border-line py-2">{{ value }}</p>
  </div>
</template>
