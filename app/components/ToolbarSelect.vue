<script setup lang="ts">
const props = defineProps<{
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
}>();

const emit = defineEmits<{ select: [value: string] }>();

const open = ref(false);
const root = ref<HTMLElement | null>(null);
const listId = useId();
const current = computed(
  () => props.options.find((option) => option.value === props.value)?.label ?? "",
);

function choose(value: string) {
  open.value = false;
  if (value !== props.value) emit("select", value);
}

function onDocument(event: Event) {
  if (!root.value?.contains(event.target as Node)) open.value = false;
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    open.value = false;
    return;
  }
  if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
  event.preventDefault();
  open.value = true;
  const options = [
    ...(root.value?.querySelectorAll<HTMLElement>("[role='option']") ?? []),
  ];
  const selected = options.findIndex(
    (node) => node.getAttribute("aria-selected") === "true",
  );
  const next =
    event.key === "ArrowDown"
      ? Math.min(options.length - 1, selected + 1)
      : Math.max(0, selected <= 0 ? 0 : selected - 1);
  options[next]?.focus();
}

onMounted(() => document.addEventListener("pointerdown", onDocument));
onBeforeUnmount(() => document.removeEventListener("pointerdown", onDocument));
</script>

<template>
  <div
    ref="root"
    class="toolbar-select"
    :class="{ 'toolbar-select--open': open }"
    @keydown="onKeydown"
  >
    <button
      type="button"
      class="toolbar-select__label"
      aria-haspopup="listbox"
      :aria-expanded="open"
      :aria-controls="listId"
      @click="open = !open"
    >
      <span>{{ label }}</span>
      <span>{{ current }}</span>
    </button>
    <div
      :id="listId"
      class="toolbar-select__list"
      :class="{ 'toolbar-select__list--open': open }"
      role="listbox"
      :aria-label="label"
      :aria-hidden="!open"
    >
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        class="toolbar-select__item"
        role="option"
        :aria-selected="option.value === value"
        @click="choose(option.value)"
      >
        <span>{{ option.label }}</span>
      </button>
    </div>
  </div>
</template>
