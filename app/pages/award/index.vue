<script setup lang="ts">
const award = await useAwardPage();

usePageSeo({
  title: award.document.title,
  description: award.document.lead || award.document.title,
});
</script>

<template>
  <AwardPage
    :page="award.document"
    :site="award.site"
    :list-page="award.page"
    :order="award.order"
    :list="award.list"
    :featured="award.featured"
  />
</template>
