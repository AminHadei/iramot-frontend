<script setup lang="ts">
const props = defineProps<{
  title: string;
  description: string;
  to: string;
  authors?: string[];
  byLabel: string;
  image?: string;
  linkLabel?: string;
}>();

const outbound = computed(() => /^https?:\/\//.test(props.to));
</script>

<template>
  <div class="project project--column">
    <NuxtLink
      :to="to"
      class="project__image"
      :class="
        linkLabel || !image ? 'project__image--type-icon' : 'project__image--type-image'
      "
      :external="outbound || undefined"
      :target="outbound ? '_blank' : undefined"
      :rel="outbound ? 'noopener noreferrer' : undefined"
    >
      <NuxtImg v-if="image" :src="image" :alt="title" provider="none" />
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
