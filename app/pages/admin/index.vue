<script setup lang="ts">
import type { AdminStats } from "~/types/membership";
import { formatAmount } from "~/utils/money";

definePageMeta({ layout: "panel", middleware: "admin" });

const copy = await useAccountPage("adminTitle", "adminDescription");
const auth = useAuth();
const stats = ref<AdminStats | null>(null);
const error = ref("");

onMounted(async () => {
  try {
    stats.value = await auth.api().request<AdminStats>("/admin/membership/stats");
  } catch {
    error.value = copy.validation.request;
  }
});

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
  </div>
</template>
