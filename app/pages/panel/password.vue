<script setup lang="ts">
import { isApiError, messageOf } from "~/utils/apiError";
import { passwordCode, requiredCode } from "~/utils/validators";

definePageMeta({ layout: "panel", middleware: "auth" });

const copy = await useAccountPage("passwordTitle", "passwordDescription");
const auth = useAuth();
const form = reactive({ currentPassword: "", newPassword: "", confirm: "" });
const errors = reactive<Record<string, string>>({});
const message = ref("");
const formError = ref("");
const pending = ref(false);

async function submit() {
  errors.currentPassword = requiredCode(form.currentPassword)
    ? copy.validation.required
    : "";
  errors.newPassword = passwordCode(form.newPassword) ? copy.validation.password : "";
  errors.confirm = form.confirm === form.newPassword ? "" : copy.validation.confirm;
  message.value = "";
  formError.value = "";
  if (Object.values(errors).some(Boolean)) return;
  pending.value = true;
  try {
    await auth.api().request("/auth/change-password", {
      method: "POST",
      body: { currentPassword: form.currentPassword, newPassword: form.newPassword },
    });
    await auth.logout();
    await navigateTo("/auth/login");
  } catch (error) {
    formError.value = isApiError(error)
      ? messageOf(error.payload) || copy.validation.request
      : copy.validation.request;
  } finally {
    pending.value = false;
  }
}
</script>

<template>
  <div>
    <h1 class="font-heading text-4xl text-primary">{{ copy.seo.passwordTitle }}</h1>
    <form class="mt-8 grid max-w-xl gap-5" @submit.prevent="submit">
      <p v-if="message" role="status">{{ message }}</p>
      <p v-if="formError" class="text-accent" role="alert">{{ formError }}</p>
      <AccountField
        v-model="form.currentPassword"
        :label="copy.auth.currentPassword"
        :error="errors.currentPassword"
        type="password"
        autocomplete="current-password"
        required
      />
      <AccountField
        v-model="form.newPassword"
        :label="copy.auth.newPassword"
        :error="errors.newPassword"
        :hint="copy.hints.password"
        type="password"
        autocomplete="new-password"
        required
      />
      <AccountField
        v-model="form.confirm"
        :label="copy.auth.confirm"
        :error="errors.confirm"
        type="password"
        autocomplete="new-password"
        required
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
