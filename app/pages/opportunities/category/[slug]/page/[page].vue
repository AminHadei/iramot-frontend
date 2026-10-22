<script setup lang="ts">
const listing = await useArchiveListing("opportunities");

usePageSeo({
  title: listing.title,
  description: listing.description,
});
</script>

<template>
  <OpportunitiesListing :listing="listing" />
</template>
