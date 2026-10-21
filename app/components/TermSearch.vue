<script setup lang="ts">
interface GlossaryTerm {
  id: number;
  title: string;
  text: string;
  sources: number[];
}

const props = defineProps<{
  terms: string[] | GlossaryTerm[];
  label: string;
  emptyLabel: string;
  sources?: Array<{ id: number; label: string }>;
  allLabel?: string;
}>();

const query = ref("");
const source = ref<number | null>(null);

function fold(value: string) {
  return value
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/\u200c/g, "")
    .toLowerCase();
}

const detailed = computed(
  () => props.terms.length > 0 && typeof props.terms[0] !== "string",
);

const titles = computed(() => {
  if (detailed.value) return [];
  const needle = fold(query.value.trim());
  if (!needle) return [];
  return (props.terms as string[])
    .filter((term) => fold(term).includes(needle))
    .slice(0, 12);
});

const cards = computed(() => {
  if (!detailed.value) return [];
  const needle = fold(query.value.trim());
  return (props.terms as GlossaryTerm[]).filter((term) => {
    if (source.value !== null && !term.sources.includes(source.value)) return false;
    if (!needle) return true;
    return fold(`${term.title} ${term.text}`).includes(needle);
  });
});

const showEmpty = computed(() => {
  if (detailed.value) {
    return (
      (query.value.trim().length > 0 || source.value !== null) &&
      cards.value.length === 0
    );
  }
  return query.value.trim().length > 0 && titles.value.length === 0;
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
    <nav v-if="sources?.length" class="mt-6">
      <ul class="flex flex-wrap gap-2">
        <li>
          <button
            type="button"
            class="inline-block border px-3 py-1 text-sm"
            :class="
              source === null ? 'border-primary text-primary' : 'border-line text-ink'
            "
            :aria-pressed="source === null"
            @click="source = null"
          >
            {{ allLabel }}
          </button>
        </li>
        <li v-for="entry in sources" :key="entry.id">
          <button
            type="button"
            class="inline-block border px-3 py-1 text-sm"
            :class="
              source === entry.id
                ? 'border-primary text-primary'
                : 'border-line text-ink'
            "
            :aria-pressed="source === entry.id"
            @click="source = entry.id"
          >
            {{ entry.label }}
          </button>
        </li>
      </ul>
    </nav>
    <p v-if="showEmpty" class="mt-4 text-sm">{{ emptyLabel }}</p>
    <ul
      v-else-if="titles.length"
      class="mt-4 divide-y divide-line border-y border-line"
    >
      <li
        v-for="(term, index) in titles"
        :key="`${term}-${index}`"
        class="py-3 text-ink"
      >
        {{ term }}
      </li>
    </ul>
    <div v-else-if="cards.length" class="mt-8 grid gap-5 wide:grid-cols-3">
      <PostListing
        v-for="term in cards"
        :key="term.id"
        :title="term.title"
        :excerpt="term.text"
      />
    </div>
  </div>
</template>
