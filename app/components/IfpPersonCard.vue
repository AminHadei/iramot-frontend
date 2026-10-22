<script setup lang="ts">
defineProps<{
  person: {
    name: string;
    role: string;
    image: string;
    links: { href: string; label: string }[];
  };
}>();
</script>

<template>
  <div class="people-group__person person-card">
    <div class="person-card__image">
      <NuxtImg
        :src="person.image"
        :alt="person.name"
        width="300"
        height="300"
        provider="none"
      />
    </div>
    <div class="person-card__name">{{ person.name }}</div>
    <div class="person-card__title">{{ person.role }}</div>
    <div v-if="person.links.length" class="person-card__contacts">
      <a
        v-for="link in person.links"
        :key="`${link.label}-${link.href}`"
        :href="link.href"
        target="_blank"
        rel="noopener noreferrer"
      >
        {{ link.label }}
      </a>
    </div>
  </div>
</template>
