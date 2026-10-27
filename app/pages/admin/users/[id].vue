<script setup lang="ts">
import type { AdminUser } from "~/types/membership";
import { isApiError, messageOf } from "~/utils/apiError";

definePageMeta({ layout: "panel", middleware: "admin" });

const copy = await useAccountPage("userEditTitle", "userEditDescription");
const auth = useAuth();
const route = useRoute();
const id = computed(() => String(route.params.id ?? ""));
const user = ref<AdminUser | null>(null);
const role = ref("user");
const active = ref("true");
const error = ref("");
const message = ref("");

onMounted(async () => {
  try {
    user.value = await auth
      .api()
      .request<AdminUser>(`/admin/users/${encodeURIComponent(id.value)}`);
    role.value = user.value.role || "user";
    active.value = user.value.active === false ? "false" : "true";
  } catch {
    error.value = copy.validation.request;
  }
});

async function save() {
  error.value = "";
  try {
    user.value = await auth
      .api()
      .request<AdminUser>(`/admin/users/${encodeURIComponent(id.value)}`, {
        method: "PATCH",
        body: { role: role.value, active: active.value === "true" },
      });
    message.value = copy.actions.save;
  } catch (reason) {
    error.value = isApiError(reason)
      ? messageOf(reason.payload) || copy.validation.request
      : copy.validation.request;
  }
}
</script>

<template>
  <form class="grid max-w-xl gap-5" @submit.prevent="save">
    <h1 class="font-heading text-4xl text-primary">{{ copy.seo.userEditTitle }}</h1>
    <p v-if="user">{{ user.firstName }} {{ user.lastName }} — {{ user.mobile }}</p>
    <p v-if="error" class="text-accent" role="alert">{{ error }}</p>
    <p v-if="message" role="status">{{ message }}</p>
    <AccountSelect
      v-model="role"
      :label="copy.fields.role"
      :options="[
        { value: 'user', label: copy.fields.user },
        { value: 'admin', label: copy.fields.adminRole },
      ]"
    />
    <AccountSelect
      v-model="active"
      :label="copy.fields.status"
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
