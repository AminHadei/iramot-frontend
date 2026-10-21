<script setup lang="ts">
defineProps<{
  filters: Array<{
    label: string;
    to: string;
    current: boolean;
  }>;
}>();
</script>

<template>
  <nav>
    <ul class="flex flex-wrap gap-2">
      <li v-for="filter in filters" :key="filter.to">
        <NuxtLink
          :to="filter.to"
          class="inline-block border px-3 py-1 text-sm"
          :class="
            filter.current ? 'border-primary text-primary' : 'border-line text-ink'
          "
          :aria-current="filter.current ? 'page' : undefined"
        >
          {{ filter.label }}
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>
