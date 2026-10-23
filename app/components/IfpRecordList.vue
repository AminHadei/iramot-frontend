<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
  media: "logo" | "cover";
  wide?: boolean;
  empty: string;
  websiteLabel: string;
  externalLabel: string;
  items: Array<{
    id: number | string;
    name: string;
    tone: 0 | 1 | 2;
    image?: { src: string; width: number; height: number; alt: string };
    description?: string;
    url?: string;
  }>;
}>();
</script>

<template>
  <div>
    <div class="hero-intro hero-intro--compact">
      <h1 class="hero-intro__title">{{ title }}</h1>
      <div class="hero-intro__body">
        <p>{{ description }}</p>
      </div>
    </div>
    <div class="people-group-list list-page">
      <p v-if="!items.length" class="list-empty">{{ empty }}</p>
      <ul
        v-else
        class="people-group__list list-grid"
        :class="{ 'list-grid--logos': wide }"
      >
        <li v-for="item in items" :key="item.id">
          <IfpListCard
            :name="item.name"
            :media="media"
            :tone="item.tone"
            :image="item.image"
            :description="item.description"
            :links="item.url ? [{ href: item.url, label: websiteLabel }] : []"
            :external-label="externalLabel"
          />
        </li>
      </ul>
    </div>
  </div>
</template>
