<script setup lang="ts">
import { splitByRanges } from "~/utils/persianSearch";
import type { Range } from "~/utils/persianSearch";

const props = defineProps<{
  id: number;
  fa: string | null;
  en: string;
  text: string;
  sources: Array<{ id: number; label: string }>;
  date: string | null;
  ranges: { en: Range[]; fa: Range[]; text: Range[] } | null;
  expandLabel: string;
  collapseLabel: string;
  definitionLabel: string;
}>();

const expanded = ref(false);
const textId = computed(() => `term-def-${props.id}`);
const title = computed(() => props.fa || props.en);
const canClamp = computed(
  () => props.text.length > 220 && (props.ranges?.text.length ?? 0) === 0,
);
const clamped = computed(() => canClamp.value && !expanded.value);

watch(
  () => props.ranges,
  () => {
    expanded.value = false;
  },
);

function pieces(value: string, ranges: readonly Range[] | undefined) {
  if (!ranges?.length) return [{ text: value, hit: false }];
  return splitByRanges(value, ranges);
}

const titleParts = computed(() =>
  pieces(title.value, props.fa ? props.ranges?.fa : props.ranges?.en),
);
const enParts = computed(() => pieces(props.en, props.ranges?.en));
const textParts = computed(() => pieces(props.text, props.ranges?.text));
</script>

<template>
  <li class="post-listing post-listing--no-image post-listing--term" tabindex="-1">
    <div class="post-listing__content">
      <div
        class="post-listing__title"
        :dir="fa ? undefined : 'ltr'"
        :lang="fa ? undefined : 'en'"
      >
        <template v-for="(part, index) in titleParts" :key="index">
          <mark v-if="part.hit" class="term-hit">{{ part.text }}</mark>
          <template v-else>{{ part.text }}</template>
        </template>
      </div>
      <div v-if="fa" class="term-card__en" dir="ltr" lang="en">
        <template v-for="(part, index) in enParts" :key="index">
          <mark v-if="part.hit" class="term-hit">{{ part.text }}</mark>
          <template v-else>{{ part.text }}</template>
        </template>
      </div>
      <p
        v-if="text"
        :id="textId"
        class="post-listing__excerpt term-card__text"
        :class="{ 'is-clamped': clamped }"
      >
        <template v-for="(part, index) in textParts" :key="index">
          <mark v-if="part.hit" class="term-hit">{{ part.text }}</mark>
          <template v-else>{{ part.text }}</template>
        </template>
      </p>
      <button
        v-if="canClamp"
        type="button"
        class="term-card__more"
        :aria-expanded="expanded"
        :aria-controls="textId"
        @click="expanded = !expanded"
      >
        {{ expanded ? collapseLabel : expandLabel }}
        <span class="term-card__sr">{{ definitionLabel }}</span>
      </button>
      <div v-if="sources.length || date" class="post-listing__meta">
        <div class="post-listing__info">
          <span v-for="source in sources" :key="source.id" class="term-card__source">
            {{ source.label }}
          </span>
          <div v-if="date" class="post-listing__date">
            <PersianDate :date="date" />
          </div>
        </div>
      </div>
    </div>
  </li>
</template>
