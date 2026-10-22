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

function onSource(event: Event) {
  const value = (event.target as HTMLSelectElement).value;
  source.value = value === "" ? null : Number(value);
}
</script>

<template>
  <div id="filter" class="post-listing-list">
    <div class="post-listing-list__toolbar">
      <div class="filter-toolbar filter-toolbar--search filter-toolbar--loaded">
        <form class="menu-search-form" @submit.prevent>
          <label class="filter-toolbar__filter-text">
            {{ label }}
            <input v-model="query" type="search" :aria-label="label" />
          </label>
        </form>
        <div v-if="sources?.length" class="filter-toolbar__taxonomy-filters">
          <div class="filter-toolbar__control filter-toolbar__control--no-js">
            <select
              class="filter-toolbar__button"
              :aria-label="allLabel"
              @change="onSource"
            >
              <option value="">{{ allLabel }}</option>
              <option v-for="entry in sources" :key="entry.id" :value="entry.id">
                {{ entry.label }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>
    <p v-if="showEmpty" class="post-listing-list__no-results">{{ emptyLabel }}</p>
    <div v-else-if="titles.length" class="post-listing-list__list">
      <PostListing
        v-for="(term, index) in titles"
        :key="`${term}-${index}`"
        :title="term"
      />
    </div>
    <div v-else-if="cards.length" class="post-listing-list__list">
      <PostListing
        v-for="term in cards"
        :key="term.id"
        :title="term.title"
        :excerpt="term.text"
      />
    </div>
  </div>
</template>
