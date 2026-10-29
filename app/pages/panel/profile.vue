<script setup lang="ts">
import { applyFieldErrors, isApiError } from "~/utils/apiError";
import { emailCode } from "~/utils/validators";

definePageMeta({ layout: "panel", middleware: "auth" });

const copy = await useAccountPage("profileTitle", "profileDescription");
const auth = useAuth();
const email = ref(auth.user.value?.email ?? "");
const errors = reactive<Record<string, string>>({});
const message = ref("");
const formError = ref("");
const pending = ref(false);

async function submit() {
  errors.email = emailCode(email.value ?? "") ? copy.validation.email : "";
  formError.value = "";
  message.value = "";
  if (errors.email) return;
  pending.value = true;
  try {
    const trimmed = email.value.trim();
    await auth.updateProfile(trimmed ? { email: trimmed } : {});
    message.value = copy.actions.save;
  } catch (error) {
    if (!isApiError(error)) {
      formError.value = copy.validation.request;
      return;
    }
    formError.value =
      applyFieldErrors(error.payload, errors, ["email"]) ||
      (errors.email ? "" : copy.validation.request);
  } finally {
    pending.value = false;
  }
}
</script>

<template>
  <div>
    <h1 class="font-heading text-4xl text-primary">{{ copy.seo.profileTitle }}</h1>
    <form class="mt-8 grid max-w-xl gap-5" @submit.prevent="submit">
      <p v-if="message" role="status">{{ message }}</p>
      <p v-if="formError" class="text-accent" role="alert">{{ formError }}</p>
      <AccountLocked
        :label="copy.auth.firstName"
        :value="auth.user.value?.firstName || ''"
      />
      <AccountLocked
        :label="copy.auth.lastName"
        :value="auth.user.value?.lastName || ''"
      />
      <AccountLocked :label="copy.auth.mobile" :value="auth.user.value?.mobile || ''" />
      <AccountField
        v-model="email"
        :label="copy.auth.email"
        :error="errors.email"
        type="email"
        autocomplete="email"
      />
      <button
        class="button bg-primary px-4 py-2 text-paper"
        type="submit"
        :disabled="pending"
      >
        {{ copy.actions.save }}
      </button>
    </form>
  </div>
</template>
