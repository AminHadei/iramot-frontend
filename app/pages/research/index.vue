<script setup lang="ts">
const listing = await useArchiveListing("publications");

usePageSeo({
  title: listing.title,
  description: listing.description,
});
</script>

<template>
  <ArchiveListing v-bind="listing" shell="archive" title="" description="" />
</template>
