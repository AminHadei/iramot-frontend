<script setup lang="ts">
const props = defineProps<{
  date: string;
}>();

const label = computed(() => formatPersianDate(props.date));
</script>

<template>
  <time :datetime="date">{{ label }}</time>
</template>
