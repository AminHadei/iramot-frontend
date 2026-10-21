<script setup lang="ts">
const listing = await useArchiveListing("conference");

usePageSeo({
  title: listing.title,
  description: listing.description,
});
</script>

<template>
  <ArchiveListing v-bind="listing" />
</template>
