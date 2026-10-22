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
  (props.guide.sections ?? []).map((section) => ({
    ...section,
    items: section.items ?? [],
    paragraphs: paragraphs(section.body),
  })),
);
</script>

<template>
  <div>
    <div class="hero-intro">
      <h1 class="hero-intro__title">{{ guide.title }}</h1>
      <div v-if="guide.description" class="hero-intro__body">
        <p>{{ guide.description }}</p>
      </div>
      <div v-if="guide.links?.length" class="hero-intro__links">
        <NuxtLink
          v-for="link in guide.links"
          :key="link.to"
          :to="link.to"
          class="hero-intro__link hero-intro__link--regular"
        >
          {{ link.label }}
        </NuxtLink>
      </div>
    </div>
    <div v-if="guide.kind === 'reading'" class="reading-sections">
      <div v-for="section in sections" :key="section.title" class="reading-list">
        <div class="reading-list__overview">
          <div class="reading-list__overview-content">
            <h2 class="reading-list__title">{{ section.title }}</h2>
            <div v-if="section.paragraphs.length" class="reading-list__description">
              <p v-for="paragraph in section.paragraphs" :key="paragraph">
                {{ paragraph }}
              </p>
            </div>
          </div>
        </div>
        <div class="reading-list__blocks">
          <div class="post-selection block">
            <PostListing
              v-for="item in section.items"
              :key="item.title"
              :title="item.title"
              :excerpt="item.excerpt"
              :category="item.category"
            />
          </div>
        </div>
      </div>
    </div>
    <template v-else>
      <div v-for="section in sections" :key="section.title" class="half-content">
        <div class="half-content__body">
          <h2>{{ section.title }}</h2>
          <p v-for="paragraph in section.paragraphs" :key="paragraph">
            {{ paragraph }}
          </p>
          <PostListing
            v-for="item in section.items"
            :key="item.title"
            :title="item.title"
            :excerpt="item.excerpt"
            :category="item.category"
          />
        </div>
      </div>
    </template>
  </div>
</template>
