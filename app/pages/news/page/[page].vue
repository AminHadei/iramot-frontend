<script setup lang="ts">
const archive = await useNewsArchive();

usePageSeo({
  title: archive.title,
  description: archive.description,
});
</script>

<template>
  <NewsArchive :archive="archive" />
</template>
