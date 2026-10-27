<script setup lang="ts">
import type { MembershipPlan } from "~/types/membership";
import { asPage } from "~/utils/pageResult";
import { formatAmount, recordId } from "~/utils/money";

definePageMeta({ layout: "panel", middleware: "admin" });

const copy = await useAccountPage("plansAdminTitle", "plansAdminDescription");
const auth = useAuth();
const rows = ref<Array<Record<string, string>>>([]);
const error = ref("");

onMounted(async () => {
  try {
    const body = await auth.api().request<unknown>("/admin/membership-plans");
    const items = Array.isArray(body)
      ? (body as MembershipPlan[])
      : asPage<MembershipPlan>(body).items;
    rows.value = items
      .sort((left, right) => (left.order ?? 0) - (right.order ?? 0))
      .map((item) => ({
        id: recordId(item),
        title: item.title,
        price: `${formatAmount(item.price)} ${copy.fields.rial}`,
        duration: `${formatAmount(item.durationDays)} ${copy.fields.day}`,
        active: item.active ? copy.fields.yes : copy.fields.no,
        href: `/admin/plans/${recordId(item)}`,
      }));
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
    <p v-if="error" class="mt-4 text-accent" role="alert">{{ error }}</p>
    <AccountTable
      class="mt-6"
      :empty="copy.fields.empty"
      :columns="[
        { key: 'title', label: copy.fields.title },
        { key: 'price', label: copy.fields.price },
        { key: 'duration', label: copy.fields.durationDays },
        { key: 'active', label: copy.fields.active },
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
