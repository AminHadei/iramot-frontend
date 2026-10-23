<script setup lang="ts">
import type { SiteContent } from "~/types/content";

const route = useRoute();
const slug = oneParam(route.params.slug);
const siteState = useSite();
const groupState = useWorkgroup(slug);
const siteData = await siteState;
const groupData = await groupState;
const site = siteData.data.value as SiteContent | null;
const group = groupData.data.value;

if (!site || !group) {
  throw createError({ statusCode: 404, statusMessage: site?.ui.notFound });
}

usePageSeo({
  title: group.title,
  description: group.body[0] || group.excerpt || group.title,
  type: "article",
});
</script>

<template>
  <WorkgroupArticle :group="group" :site="site" />
</template>
