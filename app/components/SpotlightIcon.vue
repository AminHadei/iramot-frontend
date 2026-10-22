<script setup lang="ts">
const props = defineProps<{
  name: string;
}>();

const paths = [
  "M6 8h60v5H6zm0 14h40v5H6zm26 0h34v5H32zM6 36h60v5H6zm0 14h24v5H6zm18 0h42v5H24zM6 58h60v5H6z",
  "M8 8h56v56H8zm10 10v36h36V18zm10 10v16h16V28z",
  "M10 16h18v18H10zm34-6h18v18H44zM28 40h18v18H28zM16 28h22v6H16zm36 6h8v16h-6V40h-8zM34 28h8v14h-8z",
  "M8 52h14v12H8zm16-16h14v28H24zm16-16h14v44H40zm16-12h14v56H56z",
  "M36 6a26 26 0 1 0 .01 0zM33 20h6v10h10v6H39v10h-6V36H23v-6h10z",
  "M36 4 68 36 36 68 4 36zm0 16L20 36l16 16 16-16z",
];

const index = computed(() => {
  let sum = 0;
  for (const char of props.name) sum += char.codePointAt(0) ?? 0;
  return sum % paths.length;
});

const path = computed(() => paths[index.value] ?? paths[0]);
</script>

<template>
  <svg viewBox="0 0 72 72" aria-hidden="true">
    <path fill="currentColor" fill-rule="evenodd" :d="path" />
  </svg>
</template>
