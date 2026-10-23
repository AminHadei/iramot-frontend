<script setup lang="ts">
defineProps<{
  title: string;
  people: {
    name: string;
    role: string;
    image: string;
    links: { href: string; label: string; type: string }[];
  }[];
}>();

const { isOpen, reveal, maxHeight, toggle } = useAccordionPanel(false);
</script>

<template>
  <div class="people-group-list__wrapper">
    <div class="people-group-list__group people-group people-group--desktop">
      <h2 class="people-group__title">{{ title }}</h2>
      <div class="people-group__list">
        <IfpPersonCard v-for="person in people" :key="person.name" :person="person" />
      </div>
    </div>
    <div
      class="people-group-list__group people-group people-group--mobile accordion"
      :class="{ 'accordion--open': isOpen }"
    >
      <h2 class="people-group__title">
        <button type="button" class="accordion__button" @click="toggle">
          {{ title }}
          <IfpChevron />
        </button>
      </h2>
      <div
        ref="reveal"
        class="people-group__list accordion__reveal"
        :style="{ maxHeight }"
      >
        <IfpPersonCard
          v-for="person in people"
          :key="`mobile-${person.name}`"
          :person="person"
        />
      </div>
    </div>
  </div>
</template>
