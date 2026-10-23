<script setup lang="ts">
const conference = await useConferencePage();
const banner = useConferenceBanner();
const description = [banner.value.dateLine, banner.value.place, conference.intro]
  .filter((part): part is string => Boolean(part))
  .join(" ");

usePageSeo({
  title: banner.value.title ?? conference.site.ui.conferenceTitle,
  description: description || conference.site.ui.emptyBody,
});
</script>

<template>
  <ConferencePage
    :site="conference.site"
    :intro="conference.intro"
    :list-page="conference.page"
    :order="conference.order"
    :list="conference.list"
    :featured="conference.featured"
  />
</template>
