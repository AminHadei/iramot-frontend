<script setup lang="ts">
import { isApiError, messageOf } from "~/utils/apiError";
import { emailCode, requiredCode } from "~/utils/validators";

definePageMeta({ layout: "panel", middleware: "auth" });

const copy = await useAccountPage("profileTitle", "profileDescription");
const auth = useAuth();
const form = reactive({
  firstName: auth.user.value?.firstName ?? "",
  lastName: auth.user.value?.lastName ?? "",
  email: auth.user.value?.email ?? "",
});
const errors = reactive<Record<string, string>>({});
const message = ref("");
const formError = ref("");
const pending = ref(false);

async function submit() {
  errors.firstName = requiredCode(form.firstName) ? copy.validation.required : "";
  errors.lastName = requiredCode(form.lastName) ? copy.validation.required : "";
  const email = emailCode(form.email ?? "");
  errors.email = email ? copy.validation.email : "";
  formError.value = "";
  message.value = "";
  if (errors.firstName || errors.lastName || errors.email) return;
  pending.value = true;
  try {
    await auth.updateProfile({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
    });
    message.value = copy.actions.save;
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
    <h1 class="font-heading text-4xl text-primary">{{ copy.seo.profileTitle }}</h1>
    <form class="mt-8 grid max-w-xl gap-5" @submit.prevent="submit">
      <p v-if="message" role="status">{{ message }}</p>
      <p v-if="formError" class="text-accent" role="alert">{{ formError }}</p>
      <AccountField
        v-model="form.firstName"
        :label="copy.auth.firstName"
        :error="errors.firstName"
        required
      />
      <AccountField
        v-model="form.lastName"
        :label="copy.auth.lastName"
        :error="errors.lastName"
        required
      />
      <AccountField
        v-model="form.email"
        :label="copy.auth.email"
        :error="errors.email"
        type="email"
        autocomplete="email"
      />
      <p class="text-sm text-secondary">
        {{ copy.auth.mobile }}: {{ auth.user.value?.mobile }}
      </p>
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
