<script setup lang="ts">
import type { ContentField } from "~/data/admin/contentTypes";
import type { PanelCopy } from "~/types/panel";
import { resolveContentFile } from "~/utils/mediaUrl";

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

const config = useRuntimeConfig();

function mediaPreview(value: string | undefined) {
  if (!value) return "";
  if (value.startsWith("blob:") || value.startsWith("data:")) return value;
  return (
    resolveContentFile(value, {
      apiBase: config.public.apiBase,
      siteBase: config.app.baseURL,
    }) ?? ""
  );
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
      <div v-else-if="field.kind === 'html'" class="grid gap-1">
        <label :for="field.key" class="text-sm text-secondary">{{
          label(field.key)
        }}</label>
        <ClientOnly>
          <AdminRichText
            :id="field.key"
            :model-value="modelValue[field.key] || ''"
            :invalid="Boolean(errors[field.key])"
            :url-prompt="copy.fields.imageUrl || copy.fields.image"
            @update:model-value="set(field.key, $event)"
          />
          <template #fallback>
            <textarea
              :id="field.key"
              :value="modelValue[field.key] || ''"
              rows="8"
              class="account-textarea min-h-40"
              readonly
            />
          </template>
        </ClientOnly>
        <p v-if="errors[field.key]" class="text-sm text-accent" role="alert">
          {{ errors[field.key] }}
        </p>
      </div>
      <div
        v-else-if="field.kind === 'json' || field.kind === 'textarea'"
        class="grid gap-1"
      >
        <label :for="field.key" class="text-sm text-secondary">{{
          label(field.key)
        }}</label>
        <textarea
          :id="field.key"
          :value="modelValue[field.key] || ''"
          rows="8"
          class="account-textarea min-h-40"
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
      <JalaliDateField
        v-else-if="field.kind === 'date' || field.kind === 'datetime'"
        :label="label(field.key)"
        :required="field.required"
        :mode="field.kind === 'datetime' ? 'datetime' : 'date'"
        :model-value="modelValue[field.key] || ''"
        :error="errors[field.key]"
        @update:model-value="set(field.key, $event)"
      />
      <AccountFile
        v-else-if="field.kind === 'media'"
        :label="label(field.key)"
        :choose-label="copy.actions.upload"
        accept="image/*,application/pdf"
        :file-name="modelValue[field.key]"
        :preview="mediaPreview(modelValue[field.key])"
        :error="errors[field.key]"
        @select="(file) => file && emit('upload', field.key, file)"
      />
      <AccountField
        v-else
        :label="label(field.key)"
        :required="field.required"
        :model-value="modelValue[field.key] || ''"
        :error="errors[field.key]"
        :type="field.kind === 'number' ? 'number' : 'text'"
        @update:model-value="set(field.key, $event)"
      />
    </template>
  </div>
</template>
