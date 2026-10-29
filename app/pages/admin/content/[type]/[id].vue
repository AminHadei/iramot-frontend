<script setup lang="ts">
definePageMeta({ layout: "panel", middleware: "admin" });

const copy = await useAccountPage("contentEditTitle", "contentEditDescription");
const route = useRoute();
const type = computed(() => String(route.params.type ?? ""));
const itemId = computed(() => String(route.params.id ?? ""));
</script>

<template>
  <div>
    <h1 class="font-heading text-4xl text-primary">
      {{ copy.contentTypes[type] || copy.seo.contentEditTitle }}
    </h1>
    <ContentRecordForm class="mt-6" :type="type" :item-id="itemId" />
  </div>
</template>
