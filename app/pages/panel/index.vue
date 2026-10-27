<script setup lang="ts">
import type { MembershipCardInfo } from "~/types/membership";
import { isApiError } from "~/utils/apiError";

definePageMeta({ layout: "panel", middleware: "auth" });

const copy = await useAccountPage("panelTitle", "panelDescription");
const auth = useAuth();
const info = ref<MembershipCardInfo | null>(null);
const error = ref("");

onMounted(async () => {
  try {
    info.value = await auth.api().request<MembershipCardInfo>("/membership/status");
  } catch (reason) {
    if (!isApiError(reason) || reason.status !== 404)
      error.value = copy.validation.request;
  }
});

const statusLabel = computed(
  () => copy.status[info.value?.status ?? ""] ?? copy.fields.noMembership,
);
</script>

<template>
  <div>
    <h1 class="font-heading text-4xl text-primary">{{ copy.seo.panelTitle }}</h1>
    <p class="mt-4 max-w-2xl">{{ copy.seo.panelDescription }}</p>
    <p v-if="error" class="mt-4 text-accent" role="alert">{{ error }}</p>
    <section class="mt-8 border border-line bg-[#faf9f7] p-5">
      <h2 class="text-xl text-primary">{{ copy.nav.membership }}</h2>
      <p class="mt-3">{{ statusLabel }}</p>
      <p v-if="info?.planTitle" class="mt-2">{{ info.planTitle }}</p>
      <p v-if="info?.expiresAt" class="mt-2">
        {{ copy.fields.expires }}:
        <PersianDate :date="info.expiresAt" />
      </p>
      <p v-if="info?.memberCode" class="mt-2">
        {{ copy.fields.memberCode }}: {{ info.memberCode }}
      </p>
      <p v-if="!info" class="mt-2 text-secondary">{{ copy.fields.noMembership }}</p>
      <NuxtLink class="button mt-6 inline-block" to="/panel/membership">
        {{ copy.actions.apply }}
      </NuxtLink>
    </section>
  </div>
</template>
