<script setup lang="ts">
const props = defineProps<{
  terms: string[];
  label: string;
  emptyLabel: string;
}>();

const query = ref("");

const matches = computed(() => {
  const needle = query.value.trim().toLowerCase();
  if (!needle) return [];
  return props.terms.filter((term) => term.toLowerCase().includes(needle)).slice(0, 12);
});
</script>

<template>
  <div>
    <label class="grid max-w-xl gap-2 text-sm">
      {{ label }}
      <input
        v-model="query"
        type="search"
        class="border border-line bg-paper px-3 py-2 text-ink"
      />
    </label>
    <p v-if="query.trim() && matches.length === 0" class="mt-4 text-sm">
      {{ emptyLabel }}
    </p>
    <ul
      v-else-if="matches.length"
      class="mt-4 divide-y divide-line border-y border-line"
    >
      <li
        v-for="(term, index) in matches"
        :key="`${term}-${index}`"
        class="py-3 text-ink"
      >
        {{ term }}
      </li>
    </ul>
  </div>
</template>
