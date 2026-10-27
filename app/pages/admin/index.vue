<script setup lang="ts">
import type { AdminStats } from "~/types/membership";
import { isApiError, messageOf } from "~/utils/apiError";
import { formatAmount } from "~/utils/money";

definePageMeta({ layout: "panel", middleware: "admin" });

const copy = await useAccountPage("adminTitle", "adminDescription");
const auth = useAuth();
const stats = ref<AdminStats | null>(null);
const error = ref("");
const rebuild = ref("");
const pending = ref(false);
const publishReady = ref(false);
const publishEnabled = ref(false);
const { ask } = useConfirmDialog();

onMounted(async () => {
  const [statsResult, rebuildResult] = await Promise.allSettled([
    auth.api().request<AdminStats>("/admin/membership/stats"),
    auth.api().request<{ enabled?: boolean }>("/admin/rebuild"),
  ]);
  if (statsResult.status === "fulfilled") stats.value = statsResult.value;
  else error.value = copy.validation.request;
  publishEnabled.value =
    rebuildResult.status === "fulfilled" && rebuildResult.value.enabled === true;
  publishReady.value = true;
});

async function publish() {
  if (!publishEnabled.value) return;
  const confirmed = await ask({
    title: copy.actions.publish,
    message: copy.fields.publishConfirm,
    confirmLabel: copy.actions.publish,
    cancelLabel: copy.actions.cancel,
  });
  if (!confirmed) return;
  pending.value = true;
  rebuild.value = copy.fields.rebuildPending;
  try {
    const result = await auth
      .api()
      .request<{ enabled?: boolean; triggered?: boolean }>("/admin/rebuild", {
        method: "POST",
        body: {},
      });
    if (result.enabled === false) {
      publishEnabled.value = false;
      rebuild.value = "";
      return;
    }
    rebuild.value = copy.fields.rebuildOk;
  } catch (reason) {
    rebuild.value = isApiError(reason)
      ? messageOf(reason.payload) || copy.fields.rebuildError
      : copy.fields.rebuildError;
  } finally {
    pending.value = false;
  }
}

const byStatus = computed(() => stats.value?.applicationsByStatus ?? {});
const applicationTotal = computed(() =>
  Object.values(byStatus.value).reduce((sum, count) => sum + Number(count || 0), 0),
);

const cards = computed(() => [
  [copy.status.pending_review, byStatus.value.pending_review],
  [copy.status.approved, byStatus.value.approved],
  [copy.adminNav.applications, applicationTotal.value],
  [copy.fields.successfulPayments, stats.value?.successfulPayments],
]);
</script>

<template>
  <div>
    <h1 class="font-heading text-4xl text-primary">{{ copy.seo.adminTitle }}</h1>
    <p v-if="error" class="mt-4 text-accent" role="alert">{{ error }}</p>
    <ul class="mt-8 grid list-none gap-4 p-0 sm:grid-cols-2">
      <li v-for="card in cards" :key="String(card[0])" class="border border-line p-4">
        <p class="text-sm text-secondary">{{ card[0] }}</p>
        <p class="mt-2 text-3xl text-primary">
          {{ formatAmount(Number(card[1] ?? 0)) }}
        </p>
      </li>
    </ul>
    <p v-if="stats?.revenue !== undefined" class="mt-4">
      {{ copy.fields.revenue }}: {{ formatAmount(stats.revenue) }}
      {{ copy.fields.toman }}
    </p>
    <section class="mt-8 grid max-w-2xl gap-3">
      <p v-if="publishReady && !publishEnabled" id="rebuild-note">
        {{ copy.fields.rebuildNote }}
      </p>
      <button
        type="button"
        class="button w-fit bg-primary px-4 py-2 text-paper"
        :disabled="pending || !publishEnabled"
        :aria-describedby="publishEnabled ? undefined : 'rebuild-note'"
        @click="publish"
      >
        {{ copy.actions.publish }}
      </button>
      <p v-if="rebuild" role="status">{{ rebuild }}</p>
    </section>
  </div>
</template>
