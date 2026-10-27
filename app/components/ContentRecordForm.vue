<script setup lang="ts">
import { contentTypeConfig, type ContentField } from "~/data/admin/contentTypes";
import type { ContentRecord } from "~/types/membership";
import { applyFieldErrors, isApiError } from "~/utils/apiError";
import { recordId } from "~/utils/money";

const props = defineProps<{
  type: string;
  itemId?: string;
}>();

const copy = await usePanelCopy();
const auth = useAuth();
const config = computed(() => contentTypeConfig(props.type));
const values = reactive<Record<string, string>>({});
const errors = reactive<Record<string, string>>({});
const sourcePayload = ref<Record<string, unknown>>({});
const htmlKey = ref("contentHtml");
const error = ref("");
const message = ref("");
const { ask } = useConfirmDialog();

function textValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value, null, 2);
}

function recordOf(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function fill(record: ContentRecord) {
  const current = config.value;
  if (!current) return;
  const payload = recordOf(record.payload);
  const source = Object.keys(payload).length ? payload : recordOf(record);
  const seo = recordOf(record.seo);
  for (const field of current.fields) {
    if (field.key === "document") continue;
    if (field.key === "body") {
      if (
        typeof source.bodyHtml === "string" &&
        typeof source.contentHtml !== "string"
      ) {
        htmlKey.value = "bodyHtml";
      } else if (
        typeof source.body === "string" &&
        typeof source.contentHtml !== "string"
      ) {
        htmlKey.value = "body";
      } else if (props.type === "event") {
        htmlKey.value = "bodyHtml";
      } else {
        htmlKey.value = "contentHtml";
      }
      values.body = textValue(
        source[htmlKey.value] ??
          source.contentHtml ??
          source.bodyHtml ??
          source.body ??
          "",
      );
      continue;
    }
    if (field.key === "image" && source.image && typeof source.image === "object") {
      const image = source.image as { url?: unknown };
      values.image = typeof image.url === "string" ? image.url : "";
      continue;
    }
    if (field.scope === "meta") {
      values[field.key] = textValue(record[field.key]);
      continue;
    }
    if (field.scope === "seo") {
      const seoKey =
        field.key === "seoTitle"
          ? "title"
          : field.key === "seoDescription"
            ? "description"
            : "image";
      values[field.key] = textValue(seo[seoKey]);
      continue;
    }
    values[field.key] = textValue(source[field.key]);
  }
  sourcePayload.value = { ...source };
}

onMounted(async () => {
  const current = config.value;
  if (!current) return;
  if (props.itemId === "new") {
    if (props.type === "event") htmlKey.value = "bodyHtml";
    for (const field of current.fields) {
      values[field.key] = field.kind === "status" ? "draft" : "";
    }
    if (props.type === "event") values.program = "workshops";
    return;
  }
  try {
    const path = current.singleton
      ? current.path
      : `${current.path}/${encodeURIComponent(props.itemId || "")}`;
    fill(await auth.api().request<ContentRecord>(path));
  } catch {
    error.value = copy.validation.request;
  }
});

function payloadBody() {
  const current = config.value;
  const payload: Record<string, unknown> = { ...sourcePayload.value };
  if (props.type === "news") {
    payload.categories ??= [];
    payload.tags ??= [];
    payload.feed ??= false;
  }
  if (props.type === "event") payload.program ??= values.program || "workshops";
  const seo: Record<string, string> = {};
  const meta: Record<string, unknown> = {};
  for (const field of current?.fields ?? []) {
    const raw = values[field.key] ?? "";
    if (field.scope === "meta") {
      if (field.kind === "number")
        meta[field.key] = raw === "" ? undefined : Number(raw);
      else if (raw) meta[field.key] = raw;
      continue;
    }
    if (field.scope === "seo") {
      if (!raw) continue;
      const seoKey =
        field.key === "seoTitle"
          ? "title"
          : field.key === "seoDescription"
            ? "description"
            : "image";
      seo[seoKey] = raw;
      continue;
    }
    if (field.key === "body") {
      payload[htmlKey.value] = raw;
      continue;
    }
    if (field.key === "image" && raw && props.type === "news") {
      payload.image = { url: raw, width: 0, height: 0, alt: "" };
      continue;
    }
    if (field.kind === "number") payload[field.key] = raw === "" ? null : Number(raw);
    else if (field.kind === "boolean") payload[field.key] = raw === "true";
    else if (raw !== "") payload[field.key] = raw;
  }
  if (current?.singleton) {
    return { status: meta.status ?? values.status ?? "draft", payload };
  }
  return {
    ...meta,
    seo: Object.keys(seo).length ? seo : undefined,
    payload,
  };
}

async function upload(key: string, file: File) {
  const form = new FormData();
  form.set("file", file);
  const uploaded = await auth
    .api()
    .request<{ url?: string; path?: string }>("/admin/media", {
      method: "POST",
      body: form,
    });
  values[key] = uploaded.url || uploaded.path || "";
}

async function save() {
  const current = config.value;
  if (!current) return;
  error.value = "";
  for (const field of current.fields) errors[field.key] = "";
  const missing = current.fields.find(
    (field: ContentField) => field.required && !values[field.key]?.trim(),
  );
  if (missing) {
    errors[missing.key] = copy.validation.required;
    return;
  }
  try {
    const body = payloadBody();
    if (current.singleton) {
      await auth.api().request(current.path, { method: "PUT", body });
    } else if (!props.itemId || props.itemId === "new") {
      const created = await auth
        .api()
        .request<ContentRecord>(current.path, { method: "POST", body });
      await navigateTo(`/admin/content/${props.type}/${recordId(created)}`);
      return;
    } else {
      await auth.api().request(`${current.path}/${encodeURIComponent(props.itemId)}`, {
        method: "PUT",
        body,
      });
    }
    message.value = copy.actions.save;
  } catch (reason) {
    if (!isApiError(reason)) {
      error.value = copy.validation.request;
      return;
    }
    const rest = applyFieldErrors(
      reason.payload,
      errors,
      current.fields.map((field) => field.key),
    );
    error.value =
      rest || (Object.values(errors).some(Boolean) ? "" : copy.validation.request);
  }
}

async function remove() {
  const current = config.value;
  if (!current || current.singleton || !props.itemId || props.itemId === "new") return;
  const confirmed = await ask({
    title: copy.actions.remove,
    message: copy.fields.deleteConfirm,
    confirmLabel: copy.actions.remove,
    cancelLabel: copy.actions.cancel,
  });
  if (!confirmed) return;
  try {
    await auth.api().request(`${current.path}/${encodeURIComponent(props.itemId)}`, {
      method: "DELETE",
    });
    await navigateTo(`/admin/content/${props.type}`);
  } catch {
    error.value = copy.fields.deleteFailed;
  }
}
</script>

<template>
  <form v-if="config" class="grid gap-5" @submit.prevent="save">
    <p v-if="error" class="text-accent" role="alert">{{ error }}</p>
    <p v-if="message" role="status">{{ message }}</p>
    <ContentFields
      :fields="config.fields"
      :model-value="values"
      :copy="copy"
      :errors="errors"
      @update:model-value="Object.assign(values, $event)"
      @upload="upload"
    />
    <div class="flex flex-wrap gap-3">
      <button class="button bg-primary px-4 py-2 text-paper" type="submit">
        {{ copy.actions.save }}
      </button>
      <button
        v-if="itemId && itemId !== 'new' && !config.singleton"
        type="button"
        class="button"
        @click="remove"
      >
        {{ copy.actions.remove }}
      </button>
    </div>
  </form>
</template>
