<script setup lang="ts">
import { isApiError, messageOf } from "~/utils/apiError";
import {
  isIranMobile,
  normalizeIranMobile,
  requiredCode,
  safeNextPath,
} from "~/utils/validators";
import type { ValidationCode } from "~/utils/validators";

definePageMeta({ middleware: "guest" });

const copy = await useAccountPage("loginTitle", "loginDescription");
const auth = useAuth();
const route = useRoute();
const mobile = ref("");
const password = ref("");
const errors = reactive<Record<string, string>>({});
const formError = ref("");
const pending = ref(false);

function text(code: ValidationCode | null) {
  return code ? copy.validation[code] : "";
}

async function submit() {
  errors.mobile = text(
    isIranMobile(mobile.value) ? null : mobile.value.trim() ? "mobile" : "required",
  );
  errors.password = text(requiredCode(password.value));
  formError.value = "";
  if (errors.mobile || errors.password) return;
  pending.value = true;
  try {
    await auth.login({
      mobile: normalizeIranMobile(mobile.value),
      password: password.value,
    });
    await navigateTo(safeNextPath(route.query.next));
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
  <div class="page-wrap py-16">
    <form class="mt-8 grid max-w-xl gap-5" @submit.prevent="submit">
      <p v-if="formError" class="text-accent" role="alert">{{ formError }}</p>
      <AccountField
        v-model="mobile"
        :label="copy.auth.mobile"
        :error="errors.mobile"
        :hint="copy.hints.mobile"
        autocomplete="username"
        required
      />
      <AccountField
        v-model="password"
        :label="copy.auth.password"
        :error="errors.password"
        type="password"
        autocomplete="current-password"
        required
      />
      <button
        class="button bg-primary px-4 py-2 text-paper"
        type="submit"
        :disabled="pending"
      >
        {{ copy.actions.login }}
      </button>
      <p>
        <NuxtLink to="/auth/forgot">{{ copy.auth.forgot }}</NuxtLink>
      </p>
      <p>
        {{ copy.auth.noAccount }}
        <NuxtLink to="/auth/register">{{ copy.actions.register }}</NuxtLink>
      </p>
    </form>
  </div>
</template>
