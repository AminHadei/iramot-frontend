<script setup lang="ts">
const props = defineProps<{
  title: string;
  to?: string;
  external?: string;
  excerpt?: string;
  category?: string;
  date?: string;
  image?: string;
  colorIndex?: number;
  swiper?: boolean;
  featured?: "contain" | "full";
}>();

const slots = useSlots();

const tone = computed(() =>
  props.category
    ? categoryColor(props.colorIndex ?? slotFromName(props.category))
    : undefined,
);

function slotFromName(name: string) {
  let sum = 0;
  for (let index = 0; index < name.length; index += 1) {
    sum += name.charCodeAt(index);
  }
  return sum % 5;
}
</script>

<template>
  <div
    class="post-listing"
    :class="{
      'post-listing--has-category post-listing--category-has-color': category,
      'post-listing--no-image': !image,
      'post-listing--featured post-listing--featured-contain': featured === 'contain',
      'post-listing--featured post-listing--featured-full-bleed': featured === 'full',
      'simple-swiper__item': swiper,
    }"
    :style="tone"
  >
    <NuxtLink
      v-if="to && !slots.default"
      class="post-listing__anchor"
      :to="to"
      :aria-label="title"
    />
    <a
      v-else-if="external && !slots.default"
      class="post-listing__anchor"
      :href="external"
      rel="noopener noreferrer"
      :aria-label="title"
    />
    <div v-if="category" class="post-listing__category">
      <div class="post-listing__category-name">{{ category }}</div>
    </div>
    <div class="post-listing__image">
      <NuxtImg v-if="image" :src="image" :alt="title" provider="none" />
    </div>
    <div class="post-listing__content">
      <div class="post-listing__title">
        <NuxtLink v-if="to && slots.default" :to="to">{{ title }}</NuxtLink>
        <a
          v-else-if="external && slots.default"
          :href="external"
          rel="noopener noreferrer"
          >{{ title }}</a
        >
        <template v-else>{{ title }}</template>
      </div>
      <div v-if="excerpt" class="post-listing__excerpt">{{ excerpt }}</div>
      <slot />
      <div v-if="date" class="post-listing__meta">
        <div class="post-listing__info">
          <div class="post-listing__date">
            <PersianDate :date="date" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
