<script setup lang="ts">
import type { PaymentRecord } from "~/types/membership";
import { asPage } from "~/utils/pageResult";
import { formatAmount, recordId } from "~/utils/money";

definePageMeta({ layout: "panel", middleware: "admin" });

const copy = await useAccountPage("adminPaymentsTitle", "adminPaymentsDescription");
const auth = useAuth();
const route = useRoute();
const router = useRouter();
const status = ref(String(route.query.status ?? ""));
const rows = ref<Array<Record<string, string>>>([]);
const error = ref("");

async function load() {
  try {
    const body = await auth.api().request<unknown>("/admin/payments", {
      query: { status: status.value },
    });
    const items = Array.isArray(body)
      ? (body as PaymentRecord[])
      : asPage<PaymentRecord>(body).items;
    rows.value = items.map((item) => ({
      id: recordId(item),
      reference: item.reference || recordId(item),
      amount: `${formatAmount(item.amount)} ${copy.fields.rial}`,
      status: copy.status[item.status] ?? item.status,
    }));
  } catch {
    error.value = copy.validation.request;
  }
}

async function filter() {
  await router.replace({ query: { status: status.value } });
  await load();
}

onMounted(load);
</script>

<template>
  <div>
    <h1 class="font-heading text-4xl text-primary">
      {{ copy.seo.adminPaymentsTitle }}
    </h1>
    <form class="mt-6 grid max-w-sm gap-4" @submit.prevent="filter">
      <AccountSelect
        v-model="status"
        :label="copy.fields.status"
        :options="[
          { value: '', label: copy.fields.allStatuses },
          { value: 'success', label: copy.status.success },
          { value: 'failed', label: copy.status.failed },
          { value: 'pending', label: copy.status.pending },
        ]"
      />
      <button class="button" type="submit">{{ copy.actions.filter }}</button>
    </form>
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
