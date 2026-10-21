<script setup lang="ts">
const guide = await useGuide("independent-filmmaker-project");

usePageSeo({
  title: guide.title,
  description: guide.description,
});
</script>

<template>
  <GuideView :guide="guide" />
</template>
