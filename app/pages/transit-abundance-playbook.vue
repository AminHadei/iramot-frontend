<script setup lang="ts">
const guide = await useGuide("transit-abundance-playbook");

usePageSeo({
  title: guide.title,
  description: guide.description,
});
</script>

<template>
  <GuideView :guide="guide" />
</template>
