<script setup lang="ts">
defineProps<{
  label: string;
  submit: string;
  note: string;
}>();
</script>

<template>
  <form class="grid max-w-md gap-3" @submit.prevent>
    <label class="grid gap-2 text-sm">
      {{ label }}
      <input
        type="email"
        name="email"
        autocomplete="email"
        class="border border-line bg-paper px-3 py-2 text-ink"
      />
    </label>
    <button
      type="submit"
      class="w-fit border border-accent px-4 py-2 text-sm text-accent"
    >
      {{ submit }}
    </button>
    <p class="text-sm text-secondary">{{ note }}</p>
  </form>
</template>
