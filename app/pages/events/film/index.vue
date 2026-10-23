<script setup lang="ts">
const archive = await useEventArchive();

usePageSeo({
  title: archive.title,
  description: archive.description,
});
</script>

<template>
  <EventsArchive :archive="archive" />
</template>
