<script setup lang="ts">
import type {
  MembershipApplication,
  MembershipPlan,
  PaymentStart,
} from "~/types/membership";
import { isApiError, messageOf } from "~/utils/apiError";
import { recordId } from "~/utils/money";
import { loadPlans, pendingPaymentKey, planTitle } from "~/utils/membershipRead";

definePageMeta({ layout: "panel", middleware: "auth" });

const copy = await useAccountPage("applicationTitle", "applicationDescription");
const auth = useAuth();
const route = useRoute();
const item = ref<MembershipApplication | null>(null);
const title = ref("");
const error = ref("");
const message = ref("");
const pending = ref(false);
const id = computed(() => String(route.params.id ?? ""));

const documents = computed(() => Object.keys(item.value?.documents ?? {}));

onMounted(async () => {
  try {
    const [application, plans] = await Promise.all([
      auth
        .api()
        .request<MembershipApplication>(
          `/membership-applications/${encodeURIComponent(id.value)}`,
        ),
      loadPlans(auth.api()).catch(() => [] as MembershipPlan[]),
    ]);
    item.value = application;
    title.value = planTitle(plans, application.planId, application.planTitle);
  } catch {
    error.value = copy.validation.request;
  }
});

async function pay() {
  if (!item.value) return;
  pending.value = true;
  message.value = "";
  try {
    const payment = await auth.api().request<PaymentStart>("/payments", {
      method: "POST",
      body: { applicationId: recordId(item.value) },
    });
    sessionStorage.setItem(pendingPaymentKey, payment.paymentId);
    if (payment.redirectUrl) {
      window.location.assign(payment.redirectUrl);
      return;
    }
  } catch (reason) {
    error.value = isApiError(reason)
      ? messageOf(reason.payload) || copy.validation.request
      : copy.validation.request;
  } finally {
    pending.value = false;
  }
}
</script>

<template>
  <div>
    <h1 class="font-heading text-4xl text-primary">{{ copy.seo.applicationTitle }}</h1>
    <p v-if="error" class="mt-4 text-accent" role="alert">{{ error }}</p>
    <p v-if="message" class="mt-4" role="status">{{ message }}</p>
    <div v-if="item" class="mt-6 grid gap-3">
      <p>{{ copy.fields.plan }}: {{ title }}</p>
      <p>{{ copy.fields.status }}: {{ copy.status[item.status] ?? item.status }}</p>
      <p v-if="item.membershipNumber">
        {{ copy.fields.membershipNumber }}: {{ item.membershipNumber }}
      </p>
      <p v-if="item.rejectionReason" class="text-accent">
        {{ copy.fields.rejection }}: {{ item.rejectionReason }}
      </p>
      <p
        v-if="item.status === 'rejected' || item.status === 'draft'"
        class="text-secondary"
      >
        {{ copy.fields.resubmitHint }}
      </p>
      <ul v-if="documents.length" class="m-0 grid list-none gap-2 p-0">
        <li v-for="key in documents" :key="key">{{ key }}</li>
      </ul>
      <NuxtLink
        v-if="item.status === 'rejected' || item.status === 'draft'"
        class="button inline-block bg-primary px-4 py-2 text-paper"
        :to="`/panel/membership/apply?plan=${item.planId}&application=${item.id}`"
      >
        {{ copy.actions.resubmit }}
      </NuxtLink>
      <button
        v-if="item.status === 'pending_payment'"
        type="button"
        class="button bg-primary px-4 py-2 text-paper"
        :disabled="pending"
        @click="pay"
      >
        {{ copy.actions.pay }}
      </button>
      <NuxtLink v-if="item.status === 'approved'" to="/panel/card">{{
        copy.nav.card
      }}</NuxtLink>
    </div>
  </div>
</template>
