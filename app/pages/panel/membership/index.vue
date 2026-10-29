<script setup lang="ts">
import type { MembershipPlan } from "~/types/membership";
import { formatAmount } from "~/utils/money";
import { loadPlans } from "~/utils/membershipRead";

definePageMeta({ layout: "panel", middleware: "auth" });

const copy = await useAccountPage("plansTitle", "plansDescription");
const auth = useAuth();
const plans = ref<MembershipPlan[]>([]);
const error = ref("");

function toneOf(index: number): 0 | 1 | 2 {
  const tone = index % 3;
  return tone === 1 || tone === 2 ? tone : 0;
}

onMounted(async () => {
  try {
    const items = await loadPlans(auth.api(), true);
    plans.value = items.filter((plan) => plan.isActive !== false);
  } catch {
    error.value = copy.validation.request;
  }
});
</script>

<template>
  <div>
    <h1 class="font-heading text-4xl text-primary">{{ copy.seo.plansTitle }}</h1>
    <p class="mt-4 max-w-2xl">{{ copy.seo.plansDescription }}</p>
    <p v-if="error" class="mt-4 text-accent" role="alert">{{ error }}</p>
    <div class="project-list project-list--layout-3-col mt-8">
      <IfpListCard
        v-for="(plan, index) in plans"
        :key="plan.id"
        :name="plan.title"
        :description="(plan.benefits || []).join(' · ')"
        :tone="toneOf(index)"
        :external-label="copy.fields.toman"
      >
        <template #meta>
          <p>
            {{ formatAmount(plan.price) }} {{ copy.fields.toman }} ·
            {{ formatAmount(plan.durationMonths) }} {{ copy.fields.month }}
          </p>
        </template>
        <template #foot>
          <NuxtLink :to="`/panel/membership/apply?plan=${plan.id}`">{{
            copy.actions.apply
          }}</NuxtLink>
        </template>
      </IfpListCard>
    </div>
    <p v-if="!plans.length && !error" class="mt-6 text-secondary">
      {{ copy.fields.empty }}
    </p>
  </div>
</template>
