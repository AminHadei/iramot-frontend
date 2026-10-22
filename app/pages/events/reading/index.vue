<script setup lang="ts">
const listing = await useEventListing();

usePageSeo({
  title: listing.title,
  description: listing.description,
});
</script>

<template>
  <ArchiveListing v-bind="listing" shell="category" />
</template>
