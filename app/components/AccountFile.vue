<script setup lang="ts">
defineProps<{
  label: string;
  accept: string;
  required?: boolean;
  error?: string;
  fileName?: string;
  preview?: string;
  maxHint?: string;
}>();

const emit = defineEmits<{
  select: [file: File | null];
}>();

const id = useId();

function onChange(event: Event) {
  const input = event.target as HTMLInputElement;
  emit("select", input.files?.[0] ?? null);
}
</script>

<template>
  <div class="grid gap-2 border border-line p-3">
    <label :for="id" class="text-sm text-secondary">
      {{ label }}
      <span v-if="required" class="rwmb-required">*</span>
    </label>
    <input
      :id="id"
      type="file"
      :accept="accept"
      class="text-sm"
      :aria-invalid="error ? 'true' : undefined"
      @change="onChange"
    />
    <p v-if="fileName" class="text-sm">{{ fileName }}</p>
    <img
      v-if="preview"
      :src="preview"
      alt=""
      class="max-h-40 max-w-full object-contain"
    />
    <p v-if="maxHint" class="text-sm text-secondary">{{ maxHint }}</p>
    <p v-if="error" class="text-sm text-accent" role="alert">{{ error }}</p>
  </div>
</template>
