<script setup lang="ts">
const target = "/news/کارگروه-متناظر-استانداردسازی-مدیریت";

useHead({
  meta: [{ "http-equiv": "refresh", content: `0; url=${target}` }],
});

if (!import.meta.prerender) {
  await navigateTo(target, { redirectCode: 301 });
}
</script>

<template>
  <div />
</template>
