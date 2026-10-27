<script setup lang="ts">
import { contentTypeConfig } from "~/data/admin/contentTypes";
import type { ContentRecord } from "~/types/membership";
import { asPage } from "~/utils/pageResult";
import { recordId } from "~/utils/money";

definePageMeta({ layout: "panel", middleware: "admin" });

const copy = await useAccountPage("contentListTitle", "contentListDescription");
const auth = useAuth();
const route = useRoute();
const type = computed(() => String(route.params.type ?? ""));
const config = computed(() => contentTypeConfig(type.value));
const rows = ref<Array<Record<string, string>>>([]);
const error = ref("");
const status = ref("");
const q = ref("");

async function loadList() {
  const current = config.value;
  if (!current || current.singleton) return;
  const body = await auth.api().request<unknown>(current.path, {
    query: { status: status.value, search: q.value },
  });
  const items = Array.isArray(body)
    ? (body as ContentRecord[])
    : asPage<ContentRecord>(body).items;
  rows.value = items.map((item) => {
    const payload =
      item.payload && typeof item.payload === "object"
        ? (item.payload as Record<string, unknown>)
        : {};
    return {
      id: recordId(item),
      title: String(
        payload.title ?? payload.name ?? item.title ?? item.slug ?? recordId(item),
      ),
      status: copy.status[String(item.status ?? "")] ?? String(item.status ?? ""),
      order: String(item.sortOrder ?? ""),
      href: `/admin/content/${type.value}/${recordId(item) || "edit"}`,
    };
  });
}

onMounted(async () => {
  if (!config.value) {
    error.value = copy.validation.request;
    return;
  }
  if (config.value.singleton) return;
  try {
    await loadList();
  } catch {
    error.value = copy.validation.request;
  }
});
</script>

<template>
  <div>
    <h1 class="font-heading text-4xl text-primary">
      {{ copy.contentTypes[type] || copy.seo.contentListTitle }}
    </h1>
    <p v-if="error" class="mt-4 text-accent" role="alert">{{ error }}</p>
    <ContentRecordForm v-if="config?.singleton" :type="type" />
    <template v-else-if="config">
      <form
        class="mt-6 grid gap-4 md:grid-cols-[12rem_1fr_auto]"
        @submit.prevent="loadList"
      >
        <AccountSelect
          v-model="status"
          :label="copy.fields.status"
          :options="[
            { value: '', label: copy.fields.allStatuses },
            { value: 'draft', label: copy.status.draft },
            { value: 'published', label: copy.status.published },
          ]"
        />
        <AccountField v-model="q" :label="copy.actions.search" />
        <button class="button self-end" type="submit">{{ copy.actions.filter }}</button>
      </form>
      <NuxtLink class="button mt-4 inline-block" :to="`/admin/content/${type}/new`">
        {{ copy.actions.create }}
      </NuxtLink>
      <AccountTable
        class="mt-6"
        :empty="copy.fields.empty"
        :columns="[
          { key: 'title', label: copy.fields.title },
          { key: 'status', label: copy.fields.status },
          { key: 'order', label: copy.fields.order },
          { key: 'open', label: copy.actions.edit },
        ]"
        :rows="rows"
      >
        <template #open="{ row }">
          <NuxtLink :to="row.href">{{ copy.actions.edit }}</NuxtLink>
        </template>
      </AccountTable>
    </template>
  </div>
</template>
