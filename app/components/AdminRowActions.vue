<script setup lang="ts">
defineProps<{
  href: string;
  editLabel: string;
  removeLabel?: string;
}>();

const emit = defineEmits<{
  remove: [];
}>();
</script>

<template>
  <div class="flex items-center gap-3 whitespace-nowrap">
    <NuxtLink :to="href">{{ editLabel }}</NuxtLink>
    <button
      v-if="removeLabel"
      type="button"
      class="admin-action"
      @click="emit('remove')"
    >
      {{ removeLabel }}
    </button>
  </div>
</template>
