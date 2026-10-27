<script setup lang="ts">
import { formatAmount, recordId } from "~/utils/money";
import { loadPlans } from "~/utils/membershipRead";

definePageMeta({ layout: "panel", middleware: "admin" });

const copy = await useAccountPage("plansAdminTitle", "plansAdminDescription");
const auth = useAuth();
const { ask } = useConfirmDialog();
const rows = ref<Array<Record<string, string>>>([]);
const error = ref("");
const message = ref("");

async function load() {
  const items = await loadPlans(auth.api());
  rows.value = items.map((item) => ({
    id: recordId(item),
    title: item.title,
    price: `${formatAmount(item.price)} ${copy.fields.toman}`,
    duration: `${formatAmount(item.durationMonths)} ${copy.fields.month}`,
    active: item.isActive ? copy.fields.yes : copy.fields.no,
    href: `/admin/plans/${recordId(item)}`,
  }));
}

async function remove(id: string) {
  error.value = "";
  const confirmed = await ask({
    title: copy.actions.remove,
    message: copy.fields.deleteConfirm,
    confirmLabel: copy.actions.remove,
    cancelLabel: copy.actions.cancel,
  });
  if (!confirmed) return;
  try {
    await auth.api().request(`/membership-plans/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    message.value = copy.fields.deleteDone;
    await load();
  } catch {
    error.value = copy.fields.deleteFailed;
  }
}

onMounted(async () => {
  try {
    await load();
  } catch {
    error.value = copy.validation.request;
  }
});
</script>

<template>
  <div>
    <div class="flex flex-wrap items-end justify-between gap-4">
      <h1 class="font-heading text-4xl text-primary">{{ copy.seo.plansAdminTitle }}</h1>
      <NuxtLink class="button" to="/admin/plans/new">{{
        copy.actions.create
      }}</NuxtLink>
    </div>
    <p v-if="message" class="mt-4" role="status">{{ message }}</p>
    <p v-if="error" class="mt-4 text-accent" role="alert">{{ error }}</p>
    <AccountTable
      class="mt-6"
      :empty="copy.fields.empty"
      :columns="[
        { key: 'title', label: copy.fields.title },
        { key: 'price', label: copy.fields.price },
        { key: 'duration', label: copy.fields.durationMonths },
        { key: 'active', label: copy.fields.active },
        { key: 'open', label: copy.actions.operations },
      ]"
      :rows="rows"
    >
      <template #open="{ row }">
        <AdminRowActions
          :href="row.href || ''"
          :edit-label="copy.actions.edit"
          :remove-label="copy.actions.remove"
          @remove="remove(row.id || '')"
        />
      </template>
    </AccountTable>
  </div>
</template>
