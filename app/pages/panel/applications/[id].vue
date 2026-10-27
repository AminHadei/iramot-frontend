<script setup lang="ts">
import type { MembershipApplication } from "~/types/membership";
import { isApiError, messageOf } from "~/utils/apiError";
import { formatAmount } from "~/utils/money";

definePageMeta({ layout: "panel", middleware: "auth" });

const copy = await useAccountPage("applicationTitle", "applicationDescription");
const auth = useAuth();
const route = useRoute();
const item = ref<MembershipApplication | null>(null);
const error = ref("");
const message = ref("");
const pending = ref(false);
const id = computed(() => String(route.params.id ?? ""));

onMounted(async () => {
  try {
    item.value = await auth
      .api()
      .request<MembershipApplication>(
        `/membership/applications/${encodeURIComponent(id.value)}`,
      );
  } catch {
    error.value = copy.validation.request;
  }
});

async function resubmit() {
  pending.value = true;
  message.value = "";
  try {
    item.value = await auth
      .api()
      .request<MembershipApplication>(
        `/membership/applications/${encodeURIComponent(id.value)}/resubmit`,
        { method: "POST", body: {} },
      );
    message.value = copy.actions.resubmit;
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
      <p>{{ copy.fields.plan }}: {{ item.planTitle || item.planId }}</p>
      <p>{{ copy.fields.status }}: {{ copy.status[item.status] ?? item.status }}</p>
      <p>
        {{ copy.fields.finalPrice }}: {{ formatAmount(item.finalPrice ?? item.price) }}
        {{ copy.fields.rial }}
      </p>
      <p v-if="item.rejectionReason" class="text-accent">
        {{ copy.fields.rejection }}: {{ item.rejectionReason }}
      </p>
      <p v-if="item.status === 'rejected'" class="text-secondary">
        {{ copy.fields.resubmitHint }}
      </p>
      <ul v-if="item.documents?.length" class="m-0 grid list-none gap-2 p-0">
        <li v-for="document in item.documents" :key="document.url">
          <a :href="document.url" target="_blank" rel="noopener noreferrer">
            {{ document.name || document.key }}
          </a>
        </li>
      </ul>
      <button
        v-if="item.status === 'rejected'"
        type="button"
        class="button bg-primary px-4 py-2 text-paper"
        :disabled="pending"
        @click="resubmit"
      >
        {{ copy.actions.resubmit }}
      </button>
      <NuxtLink v-if="item.status === 'approved'" to="/panel/card">{{
        copy.nav.card
      }}</NuxtLink>
    </div>
  </div>
</template>
