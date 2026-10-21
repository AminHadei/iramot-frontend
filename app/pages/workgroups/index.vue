<script setup lang="ts">
const listing = await useArchiveListing("workgroups");

usePageSeo({
  title: listing.title,
  description: listing.description,
});
</script>

<template>
  <ArchiveListing v-bind="listing" />
</template>
