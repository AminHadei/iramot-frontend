<script setup lang="ts">
const listing = await useArchiveListing("quarterlies");

usePageSeo({
  title: listing.title,
  description: listing.description,
});
</script>

<template>
  <ArchiveListing v-bind="listing" shell="archive" />
</template>
