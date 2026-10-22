<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
  to: string;
  authors?: string[];
  byLabel: string;
  image?: string;
}>();
</script>

<template>
  <div class="project project--column">
    <NuxtLink
      :to="to"
      class="project__image"
      :class="image ? 'project__image--type-image' : 'project__image--type-icon'"
    >
      <NuxtImg v-if="image" :src="image" :alt="title" provider="none" />
      <SiteMark v-else placeholder />
    </NuxtLink>
    <div class="project__body">
      <div class="project__title">
        <NuxtLink :to="to">{{ title }}</NuxtLink>
      </div>
      <div v-if="authors?.length" class="project__subtitle">
        {{ byLabel }} {{ formatAuthors(authors) }}
      </div>
      <div class="project__description">{{ description }}</div>
    </div>
  </div>
</template>
