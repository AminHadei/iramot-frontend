<script setup lang="ts">
import type { AdminUser } from "~/types/membership";
import { applyFieldErrors, isApiError, messageOf } from "~/utils/apiError";

definePageMeta({ layout: "panel", middleware: "admin" });

const copy = await useAccountPage("userEditTitle", "userEditDescription");
const auth = useAuth();
const route = useRoute();
const id = computed(() => String(route.params.id ?? ""));
const user = ref<AdminUser | null>(null);
const form = reactive({
  firstName: "",
  lastName: "",
  mobile: "",
  email: "",
});
const role = ref("user");
const active = ref("true");
const errors = reactive<Record<string, string>>({});
const error = ref("");
const message = ref("");

onMounted(async () => {
  try {
    user.value = await auth
      .api()
      .request<AdminUser>(`/users/${encodeURIComponent(id.value)}`);
    form.firstName = user.value.firstName || "";
    form.lastName = user.value.lastName || "";
    form.mobile = user.value.mobile || "";
    form.email = user.value.email || "";
    role.value = user.value.role || "user";
    active.value =
      user.value.isActive === false || user.value.active === false ? "false" : "true";
  } catch {
    error.value = copy.validation.request;
  }
});

async function save() {
  error.value = "";
  message.value = "";
  for (const key of Object.keys(errors)) errors[key] = "";
  try {
    const userId = encodeURIComponent(id.value);
    const email = form.email.trim();
    user.value = await auth.api().request<AdminUser>(`/users/${userId}`, {
      method: "PUT",
      body: {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        mobile: form.mobile.trim(),
        ...(email ? { email } : {}),
      },
    });
    await auth.api().request(`/users/${userId}/role`, {
      method: "PATCH",
      body: { role: role.value },
    });
    user.value = await auth.api().request<AdminUser>(`/users/${userId}/status`, {
      method: "PATCH",
      body: { isActive: active.value === "true" },
    });
    message.value = copy.actions.save;
  } catch (reason) {
    if (!isApiError(reason)) {
      error.value = copy.validation.request;
      return;
    }
    if (reason.status === 409) {
      errors.mobile = messageOf(reason.payload) || copy.validation.request;
      return;
    }
    error.value =
      applyFieldErrors(reason.payload, errors, [
        "firstName",
        "lastName",
        "mobile",
        "email",
        "role",
        "isActive",
      ]) || (Object.values(errors).some(Boolean) ? "" : copy.validation.request);
  }
}
</script>

<template>
  <form class="grid max-w-xl gap-5" @submit.prevent="save">
    <h1 class="font-heading text-4xl text-primary">{{ copy.seo.userEditTitle }}</h1>
    <p v-if="error" class="text-accent" role="alert">{{ error }}</p>
    <p v-if="message" role="status">{{ message }}</p>
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
      v-model="form.mobile"
      :label="copy.auth.mobile"
      :error="errors.mobile"
      required
    />
    <AccountField
      v-model="form.email"
      :label="copy.auth.email"
      :error="errors.email"
      type="email"
    />
    <AccountSelect
      v-model="role"
      :label="copy.fields.role"
      :error="errors.role"
      :options="[
        { value: 'user', label: copy.fields.user },
        { value: 'admin', label: copy.fields.adminRole },
      ]"
    />
    <AccountSelect
      v-model="active"
      :label="copy.fields.status"
      :error="errors.isActive"
      :options="[
        { value: 'true', label: copy.status.active },
        { value: 'false', label: copy.status.inactive },
      ]"
    />
    <button class="button bg-primary px-4 py-2 text-paper" type="submit">
      {{ copy.actions.save }}
    </button>
  </form>
</template>
