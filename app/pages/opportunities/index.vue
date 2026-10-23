<script setup lang="ts">
const listing = await useOpportunityPage();

usePageSeo({
  title: listing.title,
});
</script>

<template>
  <OpportunitiesListing
    :title="listing.title"
    :items="listing.items"
    :page="listing.page"
    :pages="listing.pages"
    :site="listing.site"
  />
</template>
