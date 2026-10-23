<script setup lang="ts">
const { data: site } = await useSite();
const route = useRoute();

function bodyClass(path: string) {
  if (path === "/" || path === "/styleguide") {
    return "loaded home page-template-template-home";
  }
  if (path === "/about") return "loaded page-template-template-about";
  if (path === "/news" || path.startsWith("/news/")) {
    const parts = path.split("/").filter(Boolean);
    const article =
      parts.length === 2 && parts[1] !== "page" && parts[1] !== "category";
    return article
      ? "loaded single-post"
      : "loaded page-template-template-post-archive";
  }
  if (path === "/projects") return "loaded page-template-template-newsletters";
  if (path === "/membership")
    return "loaded page-template-template-course-general-content";
  if (path === "/opportunities" || path.startsWith("/opportunities/")) {
    return "loaded page-template-template-opportunities";
  }
  if (path === "/economics-of-ideas" || path.startsWith("/economics-of-ideas/")) {
    return "loaded page-template-template-course-landing";
  }
  if (path === "/the-launch-sequence" || path === "/transit-abundance-playbook") {
    return "loaded page-template-template-reading-list";
  }
  return "loaded";
}

useHead(() => ({
  bodyAttrs: {
    class: bodyClass(route.path),
  },
}));
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
