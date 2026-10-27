<script setup lang="ts">
import { asPage } from "~/utils/pageResult";
import { recordId } from "~/utils/money";

definePageMeta({ layout: "panel", middleware: "admin" });

const copy = await useAccountPage("membershipsTitle", "membershipsDescription");
const auth = useAuth();
const route = useRoute();
const router = useRouter();
const status = ref(String(route.query.status ?? ""));
const q = ref(String(route.query.q ?? ""));
const rows = ref<Array<Record<string, string>>>([]);
const error = ref("");

async function load() {
  try {
    const body = await auth.api().request<unknown>("/admin/memberships", {
      query: { status: status.value, q: q.value },
    });
    const items = asPage<Record<string, unknown>>(
      Array.isArray(body) ? { items: body } : body,
    ).items;
    rows.value = items.map((item) => ({
      id: recordId(item),
      title: String(item.planTitle ?? item.plan ?? item.title ?? ""),
      user: String(item.userName ?? item.mobile ?? item.userId ?? ""),
      status: copy.status[String(item.status ?? "")] ?? String(item.status ?? ""),
      expires: String(item.expiresAt ?? ""),
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
    <h1 class="font-heading text-4xl text-primary">{{ copy.seo.membershipsTitle }}</h1>
    <form
      class="mt-6 grid gap-4 md:grid-cols-[12rem_1fr_auto]"
      @submit.prevent="filter"
    >
      <AccountSelect
        v-model="status"
        :label="copy.fields.status"
        :options="[
          { value: '', label: copy.fields.allStatuses },
          { value: 'active', label: copy.status.active },
          { value: 'expired', label: copy.status.expired },
        ]"
      />
      <AccountField v-model="q" :label="copy.actions.search" />
      <button class="button self-end" type="submit">{{ copy.actions.filter }}</button>
    </form>
    <p v-if="error" class="mt-4 text-accent" role="alert">{{ error }}</p>
    <AccountTable
      class="mt-6"
      :empty="copy.fields.empty"
      :columns="[
        { key: 'user', label: copy.fields.user },
        { key: 'title', label: copy.fields.plan },
        { key: 'status', label: copy.fields.status },
        { key: 'expires', label: copy.fields.expires },
      ]"
      :rows="rows"
    />
  </div>
</template>
