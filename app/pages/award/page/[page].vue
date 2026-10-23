<script setup lang="ts">
const award = await useAwardPage();

usePageSeo({
  title: `${award.site.ui.awardHeroTitle} ${award.site.ui.awardHeroSubtitle}`,
  description: award.document.lead || award.site.ui.awardHeroTitle,
});
</script>

<template>
  <AwardPage
    :site="award.site"
    :list-page="award.page"
    :order="award.order"
    :list="award.list"
    :featured="award.featured"
  />
</template>
