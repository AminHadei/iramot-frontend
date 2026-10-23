<script setup lang="ts">
const { data: site } = await useSite();
const route = useRoute();

function bodyClass(path: string) {
  const p = path.replace(/\/+$/, "") || "/";
  if (p === "/" || p === "/styleguide") {
    return "loaded home page-template-template-home";
  }
  if (p === "/about") return "loaded page-template-template-about";
  if (p === "/news" || p.startsWith("/news/")) {
    const parts = p.split("/").filter(Boolean);
    const article =
      parts.length === 2 && parts[1] !== "page" && parts[1] !== "category";
    return article
      ? "loaded single-post"
      : "loaded page-template-template-post-archive";
  }
  if (p === "/projects") return "loaded page-template-template-newsletters";
  if (p === "/membership")
    return "loaded page-template-template-course-general-content";
  if (p === "/opportunities" || p.startsWith("/opportunities/")) {
    return "loaded page-template-template-opportunities";
  }
  if (p === "/economics-of-ideas" || p.startsWith("/economics-of-ideas/")) {
    return "loaded page-template-template-course-landing";
  }
  if (p === "/the-launch-sequence" || p === "/transit-abundance-playbook") {
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
