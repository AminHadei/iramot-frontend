<script setup lang="ts">
import type { PaymentRecord } from "~/types/membership";
import { asPage } from "~/utils/pageResult";
import { formatAmount, recordId } from "~/utils/money";

definePageMeta({ layout: "panel", middleware: "auth" });

const copy = await useAccountPage("paymentsTitle", "paymentsDescription");
const auth = useAuth();
const rows = ref<Array<Record<string, string>>>([]);
const error = ref("");

onMounted(async () => {
  try {
    const body = await auth.api().request<unknown>("/membership/payments");
    const items = Array.isArray(body)
      ? (body as PaymentRecord[])
      : asPage<PaymentRecord>(body).items;
    rows.value = items.map((item) => ({
      id: recordId(item),
      amount: `${formatAmount(item.amount)} ${copy.fields.rial}`,
      status: copy.status[item.status] ?? item.status,
      reference: item.reference || recordId(item),
    }));
  } catch {
    error.value = copy.validation.request;
  }
});
</script>

<template>
  <div>
    <h1 class="font-heading text-4xl text-primary">{{ copy.seo.paymentsTitle }}</h1>
    <p v-if="error" class="mt-4 text-accent" role="alert">{{ error }}</p>
    <AccountTable
      class="mt-6"
      :empty="copy.fields.empty"
      :columns="[
        { key: 'reference', label: copy.fields.reference },
        { key: 'amount', label: copy.fields.amountLabel },
        { key: 'status', label: copy.fields.status },
      ]"
      :rows="rows"
    />
  </div>
</template>
