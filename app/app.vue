<script setup lang="ts">
import { withBase } from "~/utils/withBase";

const { app } = useRuntimeConfig();

useHead({
  link: [
    {
      rel: "preload",
      as: "font",
      type: "font/woff2",
      href: withBase(app.baseURL, "/fonts/iranyekan/iranyekanwebregularfanum.woff2"),
      crossorigin: "anonymous",
    },
    {
      rel: "preload",
      as: "font",
      type: "font/woff2",
      href: withBase(app.baseURL, "/fonts/iranyekan/iranyekanwebboldfanum.woff2"),
      crossorigin: "anonymous",
    },
  ],
});
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
