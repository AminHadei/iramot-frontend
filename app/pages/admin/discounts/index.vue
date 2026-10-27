<script setup lang="ts">
import type { DiscountCode } from "~/types/membership";
import { asPage } from "~/utils/pageResult";
import { formatAmount, recordId } from "~/utils/money";

definePageMeta({ layout: "panel", middleware: "admin" });

const copy = await useAccountPage("discountsTitle", "discountsDescription");
const auth = useAuth();
const rows = ref<Array<Record<string, string>>>([]);
const error = ref("");

onMounted(async () => {
  try {
    const body = await auth.api().request<unknown>("/admin/discount-codes");
    const items = Array.isArray(body)
      ? (body as DiscountCode[])
      : asPage<DiscountCode>(body).items;
    rows.value = items.map((item) => ({
      id: recordId(item),
      code: item.code,
      type: item.type === "percent" ? copy.fields.percent : copy.fields.fixed,
      amount: formatAmount(item.amount),
      active: item.active ? copy.fields.yes : copy.fields.no,
      href: `/admin/discounts/${recordId(item)}`,
    }));
  } catch {
    error.value = copy.validation.request;
  }
});
</script>

<template>
  <div>
    <div class="flex flex-wrap items-end justify-between gap-4">
      <h1 class="font-heading text-4xl text-primary">{{ copy.seo.discountsTitle }}</h1>
      <NuxtLink class="button" to="/admin/discounts/new">{{
        copy.actions.create
      }}</NuxtLink>
    </div>
    <p v-if="error" class="mt-4 text-accent" role="alert">{{ error }}</p>
    <AccountTable
      class="mt-6"
      :empty="copy.fields.empty"
      :columns="[
        { key: 'code', label: copy.fields.code },
        { key: 'type', label: copy.fields.type },
        { key: 'amount', label: copy.fields.amount },
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
