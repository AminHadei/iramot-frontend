<script setup lang="ts">
import type { MembershipApplication } from "~/types/membership";
import { isApiError } from "~/utils/apiError";
import { recordId } from "~/utils/money";

definePageMeta({ layout: "panel", middleware: "auth" });

const copy = await useAccountPage("cardTitle", "cardDescription");
const auth = useAuth();
const error = ref("");
const pending = ref(false);

async function download() {
  error.value = "";
  pending.value = true;
  try {
    const membership = await auth
      .api()
      .request<MembershipApplication | null>(
        "/membership-applications/my/active-membership",
      );
    const id = membership ? recordId(membership) : "";
    if (!id || membership?.status !== "approved") {
      error.value = copy.fields.noMembership;
      return;
    }
    const blob = await auth
      .api()
      .request<Blob>(`/membership-card/${encodeURIComponent(id)}`, {
        raw: true,
      });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `membership-card-${membership?.membershipNumber || id}.png`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (reason) {
    error.value =
      isApiError(reason) && (reason.status === 403 || reason.status === 404)
        ? copy.fields.noMembership
        : copy.validation.request;
  } finally {
    pending.value = false;
  }
}
</script>

<template>
  <div>
    <h1 class="font-heading text-4xl text-primary">{{ copy.seo.cardTitle }}</h1>
    <p class="mt-4 max-w-2xl">{{ copy.seo.cardDescription }}</p>
    <p v-if="error" class="mt-4 text-accent" role="alert">{{ error }}</p>
    <button
      type="button"
      class="button mt-6 bg-primary px-4 py-2 text-paper"
      :disabled="pending"
      @click="download"
    >
      {{ copy.actions.download }}
    </button>
  </div>
</template>
