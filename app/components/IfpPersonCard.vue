<script setup lang="ts">
defineProps<{
  person: {
    name: string;
    role: string;
    image?: string;
    links: { href: string; label: string; type: string }[];
    page?: { to: string; label: string };
  };
}>();
</script>

<template>
  <div
    class="people-group__person person-card"
    :class="{ 'person-card--linked': person.page }"
  >
    <div
      class="person-card__image"
      :class="{ 'person-card__image--empty': !person.image }"
    >
      <NuxtImg
        v-if="person.image"
        :src="person.image"
        :alt="person.name"
        width="300"
        height="300"
        provider="none"
      />
      <svg v-else viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="22" r="10" />
        <path d="M12 56c2.4-14 10-20 20-20s17.6 6 20 20H12z" />
      </svg>
    </div>
    <div class="person-card__name">{{ person.name }}</div>
    <div v-if="person.role" class="person-card__title">{{ person.role }}</div>
    <div v-if="person.page" class="person-card__contacts">
      <NuxtLink class="person-card__more" :to="person.page.to">
        {{ person.page.label }}
      </NuxtLink>
    </div>
    <div v-else-if="person.links.length" class="person-card__contacts">
      <a
        v-for="link in person.links"
        :key="`${link.type}-${link.href}`"
        :href="link.href"
        :aria-label="link.label"
        :title="link.label"
        target="_blank"
        rel="noopener noreferrer"
      >
        <SocialIcon :type="link.type" />
      </a>
    </div>
  </div>
</template>
