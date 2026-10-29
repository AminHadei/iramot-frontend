<script setup lang="ts">
import type { PaymentRecord } from "~/types/membership";
import { pendingPaymentKey } from "~/utils/membershipRead";

const copy = await useAccountPage("returnTitle", "returnDescription");
const auth = useAuth();
const route = useRoute();
const message = ref(copy.fields.returnUnknown);
const reference = ref("");
const pending = ref(true);

onMounted(async () => {
  const authority = String(route.query.authority ?? "");
  const gatewayStatus = String(route.query.status ?? "");
  const stored = sessionStorage.getItem(pendingPaymentKey) ?? "";
  const paymentId = String(route.query.paymentId ?? stored);
  reference.value = paymentId;
  if (!paymentId || !authority) {
    pending.value = false;
    if (
      ["nok", "failed", "cancel", "cancelled"].includes(gatewayStatus.toLowerCase())
    ) {
      message.value = copy.fields.returnFailed;
    }
    return;
  }
  try {
    const payment = await auth
      .api()
      .request<PaymentRecord>(`/payments/${encodeURIComponent(paymentId)}/verify`, {
        method: "POST",
        query: { authority, status: gatewayStatus },
      });
    sessionStorage.removeItem(pendingPaymentKey);
    reference.value = payment.refId || payment.id || paymentId;
    message.value =
      payment.status === "success"
        ? copy.fields.returnSuccess
        : copy.fields.returnFailed;
  } catch {
    message.value = copy.fields.returnFailed;
  } finally {
    pending.value = false;
  }
});
</script>

<template>
  <div>
    <h1 class="font-heading text-4xl text-primary">{{ copy.seo.returnTitle }}</h1>
    <p class="mt-6 max-w-2xl" role="status">
      {{ pending ? copy.fields.loading : message }}
    </p>
    <p v-if="reference" class="mt-3 text-sm text-secondary">
      {{ copy.fields.reference }}: {{ reference }}
    </p>
    <NuxtLink class="button mt-8 inline-block" to="/panel/applications">
      {{ copy.nav.applications }}
    </NuxtLink>
  </div>
</template>
