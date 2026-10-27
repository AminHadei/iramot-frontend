<script setup lang="ts">
const props = defineProps<{
  label: string;
  modelValue: string;
  error?: string;
  type?: string;
  autocomplete?: string;
  hint?: string;
  required?: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const id = useId();
const described = computed(() =>
  props.error || props.hint ? `${id}-help` : undefined,
);
</script>

<template>
  <div class="grid gap-1">
    <label :for="id" class="text-sm text-secondary">
      {{ label }}
      <span v-if="required" class="rwmb-required">*</span>
    </label>
    <input
      :id="id"
      :type="type || 'text'"
      :autocomplete="autocomplete"
      :value="modelValue"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="described"
      class="border-b border-line bg-transparent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <p v-if="hint && !error" :id="`${id}-help`" class="text-sm text-secondary">
      {{ hint }}
    </p>
    <p v-if="error" :id="`${id}-help`" class="text-sm text-accent" role="alert">
      {{ error }}
    </p>
  </div>
</template>
