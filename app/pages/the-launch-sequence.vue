<script setup lang="ts">
const guide = await useGuide("the-launch-sequence");

usePageSeo({
  title: guide.title,
  description: guide.description,
});
</script>

<template>
  <GuideView :guide="guide" />
</template>
