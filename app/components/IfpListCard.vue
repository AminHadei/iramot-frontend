<script setup lang="ts">
import { looksLikeHtml } from "~/utils/richText";
import { sanitizePublicHtml } from "~/utils/sanitizeHtml";
const props = withDefaults(
  defineProps<{
    name: string;
    media?: "logo" | "cover";
    tone: 0 | 1 | 2;
    image?: { src: string; width: number; height: number; alt: string };
    description?: string;
    links?: { href: string; label: string }[];
    externalLabel: string;
    wide?: boolean;
    ended?: boolean;
    opportunity?: boolean;
    initialsSource?: string;
    noreferrer?: boolean;
  }>(),
  { media: "logo", noreferrer: true },
);

const links = computed(() => props.links ?? []);
const richDescription = computed(() => looksLikeHtml(props.description ?? ""));
const safeDescription = computed(() => sanitizePublicHtml(props.description ?? ""));
const stretched = computed(() => links.value.length === 1);
const rel = computed(() => (props.noreferrer ? "noopener noreferrer" : "noopener"));

const initials = computed(() => {
  const source = props.initialsSource || props.name;
  const words = source.split(/\s+/).filter((word) => word && word !== "و");
  return words
    .slice(0, 2)
    .map((word) => Array.from(word)[0] ?? "")
    .join("");
});
</script>

<template>
  <article
    class="list-card"
    :class="{
      'list-card--link': stretched,
      'list-card--ended': ended,
      'list-card--opportunity': opportunity,
    }"
  >
    <div
      class="list-card__media"
      :class="[
        wide
          ? 'list-card__media--wide'
          : media === 'cover'
            ? 'list-card__media--cover'
            : 'list-card__media--logo',
        image ? '' : ['list-card__media--empty', `tone-${tone}`],
      ]"
    >
      <NuxtImg
        v-if="image"
        :src="image.src"
        alt=""
        :width="image.width"
        :height="image.height"
        provider="none"
      />
      <span v-else class="list-card__initials" aria-hidden="true">{{ initials }}</span>
    </div>
    <div class="list-card__body">
      <slot name="meta" />
      <h2 class="list-card__title">{{ name }}</h2>
      <p v-if="description && !richDescription" class="list-card__text">
        {{ description }}
      </p>
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div v-else-if="description" class="list-card__text" v-html="safeDescription" />
      <slot name="foot" />
      <div v-if="links.length" class="list-card__links">
        <a
          v-for="link in links"
          :key="link.href"
          class="list-card__link"
          :href="link.href"
          target="_blank"
          :rel="rel"
        >
          {{ link.label }}
          <span class="sr-only"> — {{ name }} ({{ externalLabel }})</span>
        </a>
      </div>
    </div>
  </article>
</template>
