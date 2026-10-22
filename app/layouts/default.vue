<script setup lang="ts">
const { data: site } = await useSite();
const route = useRoute();

useHead(() => {
  const homeChrome = route.path === "/" || route.path === "/styleguide";
  const membership = route.path === "/membership";
  return {
    bodyAttrs: {
      class: homeChrome
        ? "loaded home page-template-template-home"
        : membership
          ? "loaded page-template-template-course-general-content"
          : "loaded",
    },
  };
});
</script>

<template>
  <div class="min-h-screen font-sans text-ink">
    <AppHeader v-if="site" :site="site" />
    <main id="content" class="site-main">
      <slot />
    </main>
    <AppFooter v-if="site" :site="site" />
  </div>
</template>
