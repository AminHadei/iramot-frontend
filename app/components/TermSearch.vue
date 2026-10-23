<script setup lang="ts">
import type { TermSummary } from "~/data/terms/types";
import type { SearchableTerm } from "~/utils/persianSearch";
import { persianDigits } from "~/utils/persianDate";

type TermRecord = SearchableTerm & {
  slug: string;
  sourceLabels: Array<{ id: number; label: string }>;
};

const props = defineProps<{
  terms: TermSummary[];
  sources: Array<{ id: number; label: string }>;
  label: string;
  sourceLabel: string;
  allLabel: string;
  emptyLabel: string;
  pendingLabel: string;
  statusDefault: string;
  statusResults: string;
  statusEmpty: string;
  shownLabel: string;
  loadMoreLabel: string;
  clearLabel: string;
  expandLabel: string;
  collapseLabel: string;
  definitionTemplate: string;
}>();

const emit = defineEmits<{ query: [value: string] }>();

const records = computed<TermRecord[]>(() =>
  props.terms.map((term) => ({
    id: term.id,
    en: term.title,
    fa: term.fa,
    text: term.text,
    sources: term.sources.map((source) => source.id),
    date: term.date,
    slug: term.slug,
    sourceLabels: term.sources,
  })),
);

const {
  input,
  query,
  source,
  pending,
  visible,
  total,
  hasMore,
  loadMore,
  clear,
  flush,
  statusKey,
} = useTermSearch(records);

const field = ref<HTMLInputElement | null>(null);
const list = ref<HTMLElement | null>(null);

watch(query, (value) => emit("query", value));

function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_match, key: string) => {
    const value = values[key];
    if (value == null) return "";
    return typeof value === "number" ? persianDigits(value) : value;
  });
}

const status = computed(() => {
  if (statusKey.value === "results") {
    return fill(props.statusResults, { n: total.value, q: query.value });
  }
  if (statusKey.value === "empty") {
    return fill(props.statusEmpty, { q: query.value });
  }
  return fill(props.statusDefault, { n: total.value });
});

const shownText = computed(() =>
  fill(props.shownLabel, { a: visible.value.length, b: total.value }),
);

function onSource(event: Event) {
  const value = (event.target as HTMLSelectElement).value;
  source.value = value === "" ? null : Number(value);
}

function onKeydown(event: KeyboardEvent) {
  if (event.key !== "Escape" || !input.value) return;
  event.preventDefault();
  clear();
  field.value?.focus();
}

function onClear() {
  clear();
  field.value?.focus();
}

async function onLoadMore() {
  const index = visible.value.length;
  loadMore();
  await nextTick();
  list.value?.querySelectorAll<HTMLElement>(".post-listing--term")[index]?.focus();
}

function definitionLabel(title: string) {
  return fill(props.definitionTemplate, { title });
}
</script>

<template>
  <div class="term-search-region">
    <div id="filter" class="post-listing-list post-listing-list--no-qty-columns">
      <div class="post-listing-list__toolbar">
        <div
          class="filter-toolbar filter-toolbar--search filter-toolbar--loaded term-search"
          role="search"
          @keydown="onKeydown"
        >
          <form class="menu-search-form" @submit.prevent="flush">
            <div class="filter-toolbar__control">
              <label class="filter-toolbar__filter-text" for="term-q">{{
                label
              }}</label>
              <span class="term-search__field">
                <input
                  id="term-q"
                  ref="field"
                  v-model="input"
                  type="search"
                  autocomplete="off"
                  spellcheck="false"
                  enterkeyhint="search"
                />
                <button
                  type="button"
                  class="term-search__clear"
                  :hidden="!input"
                  :aria-label="clearLabel"
                  @click="onClear"
                >
                  ×
                </button>
              </span>
            </div>
          </form>
          <div class="filter-toolbar__taxonomy-filters">
            <div class="filter-toolbar__control">
              <label class="filter-toolbar__filter-text" for="term-src">{{
                sourceLabel
              }}</label>
              <select
                id="term-src"
                class="filter-toolbar__button"
                :value="source ?? ''"
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
      <div class="term-search__bar">
        <p
          id="term-status"
          class="term-search__status"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {{ status }}
        </p>
        <p class="term-search__pending" aria-hidden="true" :hidden="!pending">
          {{ pendingLabel }}
        </p>
      </div>
      <div
        id="term-results"
        class="term-results"
        :class="{ 'is-pending': pending }"
        :aria-busy="pending ? 'true' : 'false'"
      >
        <ul
          ref="list"
          class="post-listing-list__list term-list"
          :hidden="statusKey === 'empty'"
        >
          <TermCard
            v-for="hit in visible"
            :id="hit.term.id"
            :key="hit.term.id"
            :fa="hit.term.fa"
            :en="hit.term.en"
            :text="hit.term.text"
            :sources="hit.term.sourceLabels"
            :date="hit.term.date"
            :ranges="hit.ranges"
            :expand-label="expandLabel"
            :collapse-label="collapseLabel"
            :definition-label="definitionLabel(hit.term.fa || hit.term.en)"
          />
        </ul>
        <p class="post-listing-list__no-results" :hidden="statusKey !== 'empty'">
          {{ emptyLabel }}
        </p>
        <div class="term-more" :hidden="!hasMore">
          <p>{{ shownText }}</p>
          <button
            type="button"
            class="filter-toolbar__button term-more__btn"
            @click="onLoadMore"
          >
            {{ loadMoreLabel }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
