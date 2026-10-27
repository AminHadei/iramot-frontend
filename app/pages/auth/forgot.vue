<script setup lang="ts">
import { isApiError, messageOf } from "~/utils/apiError";
import {
  englishDigits,
  isIranMobile,
  normalizeIranMobile,
  passwordCode,
  requiredCode,
} from "~/utils/validators";
import type { ValidationCode } from "~/utils/validators";

definePageMeta({ middleware: "guest" });

const copy = await useAccountPage("forgotTitle", "forgotDescription");
const auth = useAuth();
const step = ref<"mobile" | "reset" | "done">("mobile");
const mobile = ref("");
const otp = ref("");
const password = ref("");
const confirm = ref("");
const errors = reactive<Record<string, string>>({});
const formError = ref("");
const pending = ref(false);

function text(code: ValidationCode | null) {
  return code ? copy.validation[code] : "";
}

function fail(error: unknown) {
  formError.value = isApiError(error)
    ? messageOf(error.payload) || copy.validation.request
    : copy.validation.request;
}

async function sendCode() {
  errors.mobile = text(
    isIranMobile(mobile.value) ? null : mobile.value.trim() ? "mobile" : "required",
  );
  formError.value = "";
  if (errors.mobile) return;
  pending.value = true;
  try {
    await auth.api().request("/auth/forgot-password", {
      method: "POST",
      auth: false,
      body: { mobile: normalizeIranMobile(mobile.value) },
    });
    step.value = "reset";
  } catch (error) {
    fail(error);
  } finally {
    pending.value = false;
  }
}

async function reset() {
  errors.otp = text(requiredCode(otp.value));
  errors.password = text(passwordCode(password.value));
  errors.confirm = confirm.value === password.value ? "" : copy.validation.confirm;
  formError.value = "";
  if (errors.otp || errors.password || errors.confirm) return;
  pending.value = true;
  try {
    await auth.api().request("/auth/reset-password", {
      method: "POST",
      auth: false,
      body: {
        mobile: normalizeIranMobile(mobile.value),
        otp: englishDigits(otp.value).trim(),
        password: password.value,
      },
    });
    step.value = "done";
  } catch (error) {
    fail(error);
  } finally {
    pending.value = false;
  }
}
</script>

<template>
  <div class="page-wrap py-16">
    <div class="hero-intro">
      <h1 class="hero-intro__title">{{ copy.seo.forgotTitle }}</h1>
      <div class="hero-intro__body">
        <p>{{ copy.seo.forgotDescription }}</p>
      </div>
    </div>
    <form
      v-if="step === 'mobile'"
      class="mt-8 grid max-w-xl gap-5"
      @submit.prevent="sendCode"
    >
      <p v-if="formError" class="text-accent" role="alert">{{ formError }}</p>
      <AccountField
        v-model="mobile"
        :label="copy.auth.mobile"
        :error="errors.mobile"
        :hint="copy.hints.mobile"
        autocomplete="tel"
        required
      />
      <button
        class="button bg-primary px-4 py-2 text-paper"
        type="submit"
        :disabled="pending"
      >
        {{ copy.actions.sendCode }}
      </button>
    </form>
    <form
      v-else-if="step === 'reset'"
      class="mt-8 grid max-w-xl gap-5"
      @submit.prevent="reset"
    >
      <p class="text-secondary">{{ copy.auth.sent }}</p>
      <p v-if="formError" class="text-accent" role="alert">{{ formError }}</p>
      <AccountField
        v-model="otp"
        :label="copy.auth.otp"
        :error="errors.otp"
        autocomplete="one-time-code"
        required
      />
      <AccountField
        v-model="password"
        :label="copy.auth.newPassword"
        :error="errors.password"
        :hint="copy.hints.password"
        type="password"
        autocomplete="new-password"
        required
      />
      <AccountField
        v-model="confirm"
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
        {{ copy.actions.resetPassword }}
      </button>
    </form>
    <div v-else class="mt-8 grid max-w-xl gap-4">
      <p role="status">{{ copy.auth.resetDone }}</p>
      <NuxtLink to="/auth/login">{{ copy.actions.login }}</NuxtLink>
    </div>
  </div>
</template>
