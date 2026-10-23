<script setup lang="ts">
const props = defineProps<{
  name: string;
  media: "logo" | "cover";
  tone: 0 | 1 | 2;
  image?: { src: string; width: number; height: number; alt: string };
  description?: string;
  links?: { href: string; label: string }[];
  externalLabel: string;
}>();

const links = computed(() => props.links ?? []);
const stretched = computed(() => links.value.length === 1);

const initials = computed(() => {
  const words = props.name.split(/\s+/).filter((word) => word && word !== "و");
  return words
    .slice(0, 2)
    .map((word) => Array.from(word)[0] ?? "")
    .join("");
});
</script>

<template>
  <article class="list-card" :class="{ 'list-card--link': stretched }">
    <div
      class="list-card__media"
      :class="[
        media === 'cover' ? 'list-card__media--cover' : 'list-card__media--logo',
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
      <h2 class="list-card__title">{{ name }}</h2>
      <p v-if="description" class="list-card__text">{{ description }}</p>
      <div v-if="links.length" class="list-card__links">
        <a
          v-for="link in links"
          :key="link.href"
          class="list-card__link"
          :href="link.href"
          target="_blank"
          rel="noopener"
        >
          {{ link.label }}
          <span class="sr-only"> — {{ name }} ({{ externalLabel }})</span>
        </a>
      </div>
    </div>
  </article>
</template>
