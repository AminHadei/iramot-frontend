<script setup lang="ts">
import type { GuideContent } from "~/types/content";

const props = defineProps<{
  guide: GuideContent;
}>();

function paragraphs(body?: string) {
  return (body ?? "")
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);
}

const sections = computed(() =>
  props.guide.sections.map((section) => ({
    ...section,
    paragraphs: paragraphs(section.body),
  })),
);
</script>

<template>
  <div>
    <HeroIntro :title="guide.title" :dek="guide.description" />
    <section v-if="guide.links.length" class="page-inset pb-10">
      <ul class="flex flex-wrap gap-x-8 gap-y-3">
        <li v-for="link in guide.links" :key="link.to">
          <NuxtLink
            :to="link.to"
            class="inline-flex items-center gap-2 text-sm text-primary"
          >
            {{ link.label }}
            <DirectionalIcon name="arrow" />
          </NuxtLink>
        </li>
      </ul>
    </section>
    <section
      v-for="section in sections"
      :key="section.title"
      class="border-t border-line"
    >
      <div class="page-inset py-16">
        <h2 class="font-heading text-3xl text-primary">{{ section.title }}</h2>
        <div
          v-if="section.paragraphs.length"
          class="mt-6 max-w-3xl space-y-4 leading-relaxed"
        >
          <p v-for="paragraph in section.paragraphs" :key="paragraph">
            {{ paragraph }}
          </p>
        </div>
        <div v-if="section.items.length" class="mt-8 grid gap-5 wide:grid-cols-3">
          <PostListing
            v-for="item in section.items"
            :key="item.title"
            :title="item.title"
            :excerpt="item.excerpt"
            :category="item.category"
          />
        </div>
      </div>
    </section>
  </div>
</template>
