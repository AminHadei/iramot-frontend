<script setup lang="ts">
defineProps<{
  label: string;
  modelValue: string;
  options: Array<{ value: string; label: string }>;
  error?: string;
  required?: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const id = useId();
</script>

<template>
  <div class="grid gap-1">
    <label :for="id" class="text-sm text-secondary">
      {{ label }}
      <span v-if="required" class="rwmb-required">*</span>
    </label>
    <select
      :id="id"
      class="rwmb-select border-b border-line bg-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      :value="modelValue"
      :aria-invalid="error ? 'true' : undefined"
      @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
    <p v-if="error" class="text-sm text-accent" role="alert">{{ error }}</p>
  </div>
</template>
