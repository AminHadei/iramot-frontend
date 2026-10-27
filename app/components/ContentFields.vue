<script setup lang="ts">
import type { ContentField } from "~/data/admin/contentTypes";
import type { PanelCopy } from "~/types/panel";

const props = defineProps<{
  fields: ContentField[];
  modelValue: Record<string, string>;
  copy: PanelCopy;
  errors: Record<string, string>;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: Record<string, string>];
  upload: [key: string, file: File];
}>();

function set(key: string, value: string) {
  emit("update:modelValue", { ...props.modelValue, [key]: value });
}

function label(key: string) {
  return props.copy.fields[key] ?? props.copy.contentTypes[key] ?? key;
}
</script>

<template>
  <div class="grid gap-5">
    <template v-for="field in fields" :key="field.key">
      <AccountSelect
        v-if="field.kind === 'status'"
        :label="label(field.key)"
        :required="field.required"
        :model-value="modelValue[field.key] || 'draft'"
        :error="errors[field.key]"
        :options="[
          { value: 'draft', label: copy.status.draft },
          { value: 'published', label: copy.status.published },
        ]"
        @update:model-value="set(field.key, $event)"
      />
      <AccountSelect
        v-else-if="field.kind === 'boolean'"
        :label="label(field.key)"
        :model-value="modelValue[field.key] || 'false'"
        :error="errors[field.key]"
        :options="[
          { value: 'true', label: copy.fields.yes },
          { value: 'false', label: copy.fields.no },
        ]"
        @update:model-value="set(field.key, $event)"
      />
      <div
        v-else-if="
          field.kind === 'html' || field.kind === 'json' || field.kind === 'textarea'
        "
        class="grid gap-1"
      >
        <label :for="field.key" class="text-sm text-secondary">{{
          label(field.key)
        }}</label>
        <textarea
          :id="field.key"
          :value="modelValue[field.key] || ''"
          rows="8"
          class="min-h-40 w-full border border-line bg-paper p-3 font-sans focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          :dir="field.kind === 'json' ? 'ltr' : undefined"
          @input="set(field.key, ($event.target as HTMLTextAreaElement).value)"
        />
        <p v-if="field.kind === 'json'" class="text-sm text-secondary">
          {{ copy.fields.jsonHint }}
        </p>
        <p v-if="errors[field.key]" class="text-sm text-accent" role="alert">
          {{ errors[field.key] }}
        </p>
      </div>
      <AccountFile
        v-else-if="field.kind === 'media'"
        :label="label(field.key)"
        :choose-label="copy.actions.upload"
        accept="image/*,application/pdf"
        :file-name="modelValue[field.key]"
        :preview="
          modelValue[field.key]?.startsWith('http') ||
          modelValue[field.key]?.startsWith('/')
            ? modelValue[field.key]
            : ''
        "
        :error="errors[field.key]"
        @select="(file) => file && emit('upload', field.key, file)"
      />
      <AccountField
        v-else
        :label="label(field.key)"
        :required="field.required"
        :model-value="modelValue[field.key] || ''"
        :error="errors[field.key]"
        :type="
          field.kind === 'number' ? 'number' : field.kind === 'date' ? 'text' : 'text'
        "
        @update:model-value="set(field.key, $event)"
      />
    </template>
  </div>
</template>
