<script setup lang="ts">
const props = defineProps<{
  label: string;
  open?: boolean;
}>();

const { isOpen, reveal, maxHeight, toggle } = useAccordionPanel(props.open ?? false);
</script>

<template>
  <div class="accordion" :class="{ 'accordion--open': isOpen }">
    <button type="button" class="accordion__button" @click="toggle">
      {{ label }}
      <IfpChevron />
    </button>
    <div ref="reveal" class="accordion__reveal" :style="{ maxHeight }">
      <slot />
    </div>
  </div>
</template>
