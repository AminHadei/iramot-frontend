<script setup lang="ts">
import type { MembershipApplication } from "~/types/membership";
import { asPage } from "~/utils/pageResult";
import { recordId } from "~/utils/money";

definePageMeta({ layout: "panel", middleware: "admin" });

const copy = await useAccountPage("queueTitle", "queueDescription");
const auth = useAuth();
const route = useRoute();
const router = useRouter();
const status = ref(String(route.query.status ?? "pending"));
const q = ref(String(route.query.q ?? ""));
const rows = ref<Array<Record<string, string>>>([]);
const error = ref("");

async function load() {
  error.value = "";
  try {
    const body = await auth.api().request<unknown>("/admin/applications", {
      query: { status: status.value, q: q.value },
    });
    const items = Array.isArray(body)
      ? (body as MembershipApplication[])
      : asPage<MembershipApplication>(body).items;
    rows.value = items.map((item) => ({
      id: recordId(item),
      title: item.planTitle || item.planId,
      person: item.personType === "legal" ? copy.fields.legal : copy.fields.natural,
      status: copy.status[item.status] ?? item.status,
      href: `/admin/applications/${recordId(item)}`,
    }));
  } catch {
    error.value = copy.validation.request;
  }
}

async function filter() {
  await router.replace({ query: { status: status.value, q: q.value } });
  await load();
}

onMounted(load);
</script>

<template>
  <div>
    <h1 class="font-heading text-4xl text-primary">{{ copy.seo.queueTitle }}</h1>
    <form
      class="mt-6 grid gap-4 md:grid-cols-[12rem_1fr_auto]"
      @submit.prevent="filter"
    >
      <AccountSelect
        v-model="status"
        :label="copy.fields.status"
        :options="[
          { value: '', label: copy.fields.allStatuses },
          { value: 'pending', label: copy.status.pending },
          { value: 'approved', label: copy.status.approved },
          { value: 'rejected', label: copy.status.rejected },
        ]"
      />
      <AccountField
        v-model="q"
        :label="copy.actions.search"
        :hint="copy.fields.searchPlaceholder"
      />
      <button class="button self-end" type="submit">{{ copy.actions.filter }}</button>
    </form>
    <p v-if="error" class="mt-4 text-accent" role="alert">{{ error }}</p>
    <AccountTable
      class="mt-6"
      :empty="copy.fields.queueEmpty"
      :columns="[
        { key: 'title', label: copy.fields.plan },
        { key: 'person', label: copy.fields.personType },
        { key: 'status', label: copy.fields.status },
        { key: 'open', label: copy.actions.edit },
      ]"
      :rows="rows"
    >
      <template #open="{ row }">
        <NuxtLink :to="row.href">{{ copy.actions.edit }}</NuxtLink>
      </template>
    </AccountTable>
  </div>
</template>
