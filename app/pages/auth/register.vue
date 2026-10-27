<script setup lang="ts">
import { applyFieldErrors, isApiError } from "~/utils/apiError";
import {
  isIranMobile,
  normalizeIranMobile,
  passwordCode,
  requiredCode,
} from "~/utils/validators";
import type { ValidationCode } from "~/utils/validators";

definePageMeta({ middleware: "guest" });

const copy = await useAccountPage("registerTitle", "registerDescription");
const auth = useAuth();
const form = reactive({
  firstName: "",
  lastName: "",
  mobile: "",
  password: "",
  confirm: "",
});
const errors = reactive<Record<string, string>>({});
const formError = ref("");
const pending = ref(false);

function text(code: ValidationCode | null) {
  return code ? copy.validation[code] : "";
}

async function submit() {
  errors.firstName = text(requiredCode(form.firstName));
  errors.lastName = text(requiredCode(form.lastName));
  errors.mobile = text(
    isIranMobile(form.mobile) ? null : form.mobile.trim() ? "mobile" : "required",
  );
  errors.password = text(passwordCode(form.password) ?? requiredCode(form.password));
  errors.confirm = form.confirm === form.password ? "" : copy.validation.confirm;
  formError.value = "";
  if (Object.values(errors).some(Boolean)) return;
  pending.value = true;
  try {
    const result = await auth.register({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      mobile: normalizeIranMobile(form.mobile),
      password: form.password,
    });
    await navigateTo(result.authenticated ? "/panel" : "/auth/login");
  } catch (error) {
    if (!isApiError(error)) {
      formError.value = copy.validation.request;
      return;
    }
    const rest = applyFieldErrors(error.payload, errors, [
      "firstName",
      "lastName",
      "mobile",
      "password",
    ]);
    formError.value =
      rest || (Object.values(errors).some(Boolean) ? "" : copy.validation.request);
  } finally {
    pending.value = false;
  }
}
</script>

<template>
  <div class="page-wrap py-16">
    <form class="mt-8 grid max-w-xl gap-5" @submit.prevent="submit">
      <p v-if="formError" class="text-accent" role="alert">{{ formError }}</p>
      <AccountField
        v-model="form.firstName"
        :label="copy.auth.firstName"
        :error="errors.firstName"
        autocomplete="given-name"
        required
      />
      <AccountField
        v-model="form.lastName"
        :label="copy.auth.lastName"
        :error="errors.lastName"
        autocomplete="family-name"
        required
      />
      <AccountField
        v-model="form.mobile"
        :label="copy.auth.mobile"
        :error="errors.mobile"
        :hint="copy.hints.mobile"
        autocomplete="tel"
        required
      />
      <AccountField
        v-model="form.password"
        :label="copy.auth.password"
        :error="errors.password"
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
        {{ copy.actions.register }}
      </button>
      <p>
        {{ copy.auth.hasAccount }}
        <NuxtLink to="/auth/login">{{ copy.actions.login }}</NuxtLink>
      </p>
    </form>
  </div>
</template>
