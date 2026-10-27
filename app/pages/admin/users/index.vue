<script setup lang="ts">
import type { AdminUser } from "~/types/membership";
import { asPage } from "~/utils/pageResult";
import { recordId } from "~/utils/money";

definePageMeta({ layout: "panel", middleware: "admin" });

const copy = await useAccountPage("usersTitle", "usersDescription");
const auth = useAuth();
const q = ref("");
const rows = ref<Array<Record<string, string>>>([]);
const error = ref("");

async function load() {
  try {
    const body = await auth
      .api()
      .request<unknown>("/admin/users", { query: { q: q.value } });
    const items = Array.isArray(body)
      ? (body as AdminUser[])
      : asPage<AdminUser>(body).items;
    rows.value = items.map((item) => ({
      id: recordId(item),
      name: `${item.firstName} ${item.lastName}`.trim(),
      mobile: item.mobile,
      role: item.role === "admin" ? copy.fields.adminRole : copy.fields.user,
      active: item.active === false ? copy.status.inactive : copy.status.active,
      href: `/admin/users/${recordId(item)}`,
    }));
  } catch {
    error.value = copy.validation.request;
  }
}

onMounted(load);
</script>

<template>
  <div>
    <h1 class="font-heading text-4xl text-primary">{{ copy.seo.usersTitle }}</h1>
    <form
      class="mt-6 grid max-w-xl gap-4 md:grid-cols-[1fr_auto]"
      @submit.prevent="load"
    >
      <AccountField
        v-model="q"
        :label="copy.actions.search"
        :hint="copy.fields.searchPlaceholder"
      />
      <button class="button self-end" type="submit">{{ copy.actions.search }}</button>
    </form>
    <p v-if="error" class="mt-4 text-accent" role="alert">{{ error }}</p>
    <AccountTable
      class="mt-6"
      :empty="copy.fields.empty"
      :columns="[
        { key: 'name', label: copy.fields.name },
        { key: 'mobile', label: copy.auth.mobile },
        { key: 'role', label: copy.fields.role },
        { key: 'active', label: copy.fields.status },
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
