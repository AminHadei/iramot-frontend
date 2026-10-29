<script setup lang="ts">
defineProps<{
  label: string;
}>();

const emit = defineEmits<{
  submit: [];
}>();
</script>

<template>
  <form class="admin-filter" @submit.prevent="emit('submit')">
    <slot />
    <button class="button admin-filter__submit" type="submit">{{ label }}</button>
  </form>
</template>
