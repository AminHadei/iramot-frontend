<script setup lang="ts">
import type { MembershipApplication, MembershipPlan } from "~/types/membership";
import { isApiError } from "~/utils/apiError";
import { loadPlans, planTitle } from "~/utils/membershipRead";

definePageMeta({ layout: "panel", middleware: "auth" });

const copy = await useAccountPage("panelTitle", "panelDescription");
const auth = useAuth();
const info = ref<MembershipApplication | null>(null);
const title = ref("");
const error = ref("");

onMounted(async () => {
  try {
    const [membership, plans] = await Promise.all([
      auth
        .api()
        .request<MembershipApplication | null>(
          "/membership-applications/my/membership",
        ),
      loadPlans(auth.api()).catch(() => [] as MembershipPlan[]),
    ]);
    info.value = membership;
    if (membership?.planId)
      title.value = planTitle(plans, membership.planId, membership.planTitle);
  } catch (reason) {
    if (!isApiError(reason) || reason.status !== 404)
      error.value = copy.validation.request;
  }
});

const statusLabel = computed(() => {
  if (!info.value) return copy.fields.noMembership;
  if (info.value.membershipState === "expired") return copy.status.expired;
  return copy.status[info.value.status] ?? info.value.status;
});
</script>

<template>
  <div>
    <h1 class="font-heading text-4xl text-primary">{{ copy.seo.panelTitle }}</h1>
    <p class="mt-4 max-w-2xl">{{ copy.seo.panelDescription }}</p>
    <p v-if="error" class="mt-4 text-accent" role="alert">{{ error }}</p>
    <section class="mt-8 border border-line bg-[#faf9f7] p-5">
      <h2 class="text-xl text-primary">{{ copy.nav.membership }}</h2>
      <p class="mt-3">{{ statusLabel }}</p>
      <p v-if="title" class="mt-2">{{ title }}</p>
      <p v-if="info?.expiresAt" class="mt-2">
        {{ copy.fields.expires }}:
        <PersianDate :date="info.expiresAt" />
      </p>
      <p v-if="info?.membershipNumber" class="mt-2">
        {{ copy.fields.memberCode }}: {{ info.membershipNumber }}
      </p>
      <NuxtLink class="button mt-6 inline-block" to="/panel/membership">
        {{ copy.actions.apply }}
      </NuxtLink>
    </section>
  </div>
</template>
