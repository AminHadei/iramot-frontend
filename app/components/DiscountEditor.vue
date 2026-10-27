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
  value: "",
  maxDiscount: "",
  active: "true",
  validFrom: "",
  validUntil: "",
  totalUsageLimit: "",
  perUserLimit: "",
  allowedPlans: "",
});
const error = ref("");
const message = ref("");

onMounted(async () => {
  if (creating.value) return;
  const item = await auth
    .api()
    .request<DiscountCode>(`/discount-codes/${encodeURIComponent(props.codeId)}`);
  form.code = item.code;
  form.type = item.type || "percent";
  form.value = String(item.value ?? "");
  form.maxDiscount = item.maxDiscount == null ? "" : String(item.maxDiscount);
  form.active = item.isActive ? "true" : "false";
  form.validFrom = item.validFrom ? String(item.validFrom).slice(0, 10) : "";
  form.validUntil = item.validUntil ? String(item.validUntil).slice(0, 10) : "";
  form.totalUsageLimit =
    item.totalUsageLimit == null ? "" : String(item.totalUsageLimit);
  form.perUserLimit = item.perUserLimit == null ? "" : String(item.perUserLimit);
  form.allowedPlans = (item.allowedPlans ?? []).join(",");
});

function payload() {
  return {
    code: form.code.trim(),
    type: form.type,
    value: Number(form.value),
    maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
    isActive: form.active === "true",
    validFrom: form.validFrom || undefined,
    validUntil: form.validUntil || undefined,
    totalUsageLimit: form.totalUsageLimit ? Number(form.totalUsageLimit) : undefined,
    perUserLimit: form.perUserLimit ? Number(form.perUserLimit) : undefined,
    allowedPlans: form.allowedPlans
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  };
}

async function save() {
  error.value = "";
  try {
    if (creating.value) {
      const created = await auth.api().request<DiscountCode>("/discount-codes", {
        method: "POST",
        body: payload(),
      });
      await navigateTo(`/admin/discounts/${recordId(created)}`);
    } else {
      await auth.api().request(`/discount-codes/${encodeURIComponent(props.codeId)}`, {
        method: "PUT",
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
  await auth.api().request(`/discount-codes/${encodeURIComponent(props.codeId)}`, {
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
    <AccountField
      v-model="form.value"
      :label="
        form.type === 'fixed'
          ? `${copy.fields.amount} (${copy.fields.toman})`
          : copy.fields.amount
      "
      required
    />
    <AccountField
      v-model="form.maxDiscount"
      :label="`${copy.fields.maxDiscount} (${copy.fields.toman})`"
    />
    <AccountField v-model="form.validFrom" :label="copy.fields.validFrom" type="date" />
    <AccountField
      v-model="form.validUntil"
      :label="copy.fields.validUntil"
      type="date"
    />
    <AccountField v-model="form.totalUsageLimit" :label="copy.fields.usageLimit" />
    <AccountField v-model="form.perUserLimit" :label="copy.fields.perUserLimit" />
    <AccountField v-model="form.allowedPlans" :label="copy.fields.plan" />
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
