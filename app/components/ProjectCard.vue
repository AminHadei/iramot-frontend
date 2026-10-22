<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title: string;
    description: string;
    to: string;
    authors?: string[];
    byLabel: string;
    image?: string;
    imageWidth?: number;
    imageHeight?: number;
    linkLabel?: string;
    imageMode?: "cover" | "icon" | "portrait" | "auto";
  }>(),
  { imageMode: "cover" },
);

const outbound = computed(() => /^https?:\/\//.test(props.to));
const loadedRatio = ref<number | null>(null);

const appearance = computed(() => {
  if (props.imageMode !== "auto") return props.imageMode;
  const ratio =
    props.imageWidth && props.imageHeight
      ? props.imageHeight / props.imageWidth
      : loadedRatio.value;
  if (ratio == null) return "cover";
  return ratio > 1.1 ? "portrait" : "cover";
});

const imageClass = computed(() => {
  if (!props.image || appearance.value === "icon") return "project__image--type-icon";
  if (appearance.value === "portrait") return "project__image--type-portrait";
  return "project__image--type-image";
});

function onImageLoad(event: Event) {
  const img = event.target;
  if (!(img instanceof HTMLImageElement)) return;
  if (img.naturalWidth > 0 && img.naturalHeight > 0) {
    loadedRatio.value = img.naturalHeight / img.naturalWidth;
  }
}
</script>

<template>
  <div class="project project--column">
    <NuxtLink
      :to="to"
      class="project__image"
      :class="imageClass"
      :external="outbound || undefined"
      :target="outbound ? '_blank' : undefined"
      :rel="outbound ? 'noopener noreferrer' : undefined"
    >
      <NuxtImg
        v-if="image"
        :src="image"
        :alt="title"
        provider="none"
        @load="onImageLoad"
      />
      <SiteMark v-else placeholder />
    </NuxtLink>
    <div class="project__body">
      <div class="project__title">
        <template v-if="linkLabel">{{ title }}</template>
        <NuxtLink
          v-else
          :to="to"
          :external="outbound || undefined"
          :target="outbound ? '_blank' : undefined"
          :rel="outbound ? 'noopener noreferrer' : undefined"
          >{{ title }}</NuxtLink
        >
      </div>
      <div v-if="!linkLabel && authors?.length" class="project__subtitle">
        {{ byLabel }} {{ formatAuthors(authors) }}
      </div>
      <div v-if="description" class="project__description">{{ description }}</div>
      <div v-if="linkLabel" class="project__links">
        <a :href="to" target="_blank" rel="noopener">{{ linkLabel }}</a>
      </div>
    </div>
  </div>
</template>
