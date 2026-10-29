<script setup lang="ts">
definePageMeta({ layout: "panel", middleware: "admin" });
const route = useRoute();
</script>

<template>
  <DiscountEditor :code-id="String(route.params.id ?? '')" />
</template>
