<script setup lang="ts">
definePageMeta({ layout: "panel", middleware: "admin" });
const route = useRoute();
const planId = computed(() => String(route.params.id ?? ""));
</script>

<template>
  <PlanEditor :plan-id="planId" />
</template>
