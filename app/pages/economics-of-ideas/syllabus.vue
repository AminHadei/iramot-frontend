<script setup lang="ts">
const guide = await useGuide("economics-of-ideas-syllabus");

usePageSeo({
  title: guide.title,
  description: guide.description,
});
</script>

<template>
  <GuideView :guide="guide" />
</template>
