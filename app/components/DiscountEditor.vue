<script setup lang="ts">
import type { DiscountCode } from "~/types/membership";
import { isApiError, messageOf } from "~/utils/apiError";
import { recordId } from "~/utils/money";

const props = defineProps<{ codeId: string }>();
const copy = await useAccountPage("discountEditTitle", "discountEditDescription");
const auth = useAuth();
const creating = computed(() => props.codeId === "new");
const form = reactive({
  code: "",
  type: "percent",
  amount: "",
  active: "true",
  expiresAt: "",
  maxUses: "",
  planIds: "",
});
const error = ref("");
const message = ref("");

onMounted(async () => {
  if (creating.value) return;
  const item = await auth
    .api()
    .request<DiscountCode>(`/admin/discount-codes/${encodeURIComponent(props.codeId)}`);
  form.code = item.code;
  form.type = item.type || "percent";
  form.amount = String(item.amount ?? "");
  form.active = item.active ? "true" : "false";
  form.expiresAt = item.expiresAt ?? "";
  form.maxUses = item.maxUses == null ? "" : String(item.maxUses);
  form.planIds = (item.planIds ?? []).join(",");
});

function payload() {
  return {
    code: form.code.trim(),
    type: form.type,
    amount: Number(form.amount),
    active: form.active === "true",
    expiresAt: form.expiresAt || null,
    maxUses: form.maxUses ? Number(form.maxUses) : null,
    planIds: form.planIds
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  };
}

async function save() {
  error.value = "";
  try {
    if (creating.value) {
      const created = await auth.api().request<DiscountCode>("/admin/discount-codes", {
        method: "POST",
        body: payload(),
      });
      await navigateTo(`/admin/discounts/${recordId(created)}`);
    } else {
      await auth
        .api()
        .request(`/admin/discount-codes/${encodeURIComponent(props.codeId)}`, {
          method: "PATCH",
          body: payload(),
        });
      message.value = copy.actions.save;
    }
  } catch (reason) {
    error.value = isApiError(reason)
      ? messageOf(reason.payload) || copy.validation.request
      : copy.validation.request;
  }
}

async function remove() {
  if (!window.confirm(copy.fields.deleteConfirm)) return;
  await auth
    .api()
    .request(`/admin/discount-codes/${encodeURIComponent(props.codeId)}`, {
      method: "DELETE",
    });
  await navigateTo("/admin/discounts");
}
</script>

<template>
  <form class="grid max-w-xl gap-5" @submit.prevent="save">
    <h1 class="font-heading text-4xl text-primary">{{ copy.seo.discountEditTitle }}</h1>
    <p v-if="error" class="text-accent" role="alert">{{ error }}</p>
    <p v-if="message" role="status">{{ message }}</p>
    <AccountField v-model="form.code" :label="copy.fields.code" required />
    <AccountSelect
      v-model="form.type"
      :label="copy.fields.type"
      :options="[
        { value: 'percent', label: copy.fields.percent },
        { value: 'fixed', label: copy.fields.fixed },
      ]"
    />
    <AccountField v-model="form.amount" :label="copy.fields.amount" required />
    <AccountField
      v-model="form.expiresAt"
      :label="copy.fields.expiresAt"
      :hint="copy.hints.birthDate"
    />
    <AccountField v-model="form.maxUses" :label="copy.fields.maxUses" />
    <AccountField v-model="form.planIds" :label="copy.fields.plan" />
    <AccountSelect
      v-model="form.active"
      :label="copy.fields.active"
      :options="[
        { value: 'true', label: copy.fields.yes },
        { value: 'false', label: copy.fields.no },
      ]"
    />
    <div class="flex flex-wrap gap-3">
      <button class="button bg-primary px-4 py-2 text-paper" type="submit">
        {{ copy.actions.save }}
      </button>
      <button v-if="!creating" type="button" class="button" @click="remove">
        {{ copy.actions.remove }}
      </button>
    </div>
  </form>
</template>
