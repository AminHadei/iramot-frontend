<script setup lang="ts">
const route = useRoute();
const raw = route.params.path;
const parts = Array.isArray(raw) ? raw : raw ? [raw] : [];
const target = parts.length ? `/news/${parts.join("/")}` : "/news";

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
