<script setup lang="ts">
import type { MembershipPlan } from "~/types/membership";
import { isApiError, messageOf } from "~/utils/apiError";
import { recordId } from "~/utils/money";

const props = defineProps<{ planId: string }>();

const copy = await useAccountPage("planEditTitle", "planEditDescription");
const auth = useAuth();
const form = reactive({
  title: "",
  price: "",
  durationDays: "365",
  benefits: "",
  documents: "",
  active: "true",
  order: "0",
  description: "",
});
const error = ref("");
const message = ref("");
const pending = ref(false);
const creating = computed(() => props.planId === "new");

onMounted(async () => {
  if (creating.value) return;
  try {
    const item = await auth
      .api()
      .request<MembershipPlan>(
        `/admin/membership-plans/${encodeURIComponent(props.planId)}`,
      );
    form.title = item.title ?? "";
    form.price = String(item.price ?? "");
    form.durationDays = String(item.durationDays ?? "");
    form.benefits = (item.benefits ?? []).join("\n");
    form.documents = (item.requiredDocuments ?? [])
      .map(
        (slot) =>
          `${slot.key}|${slot.label}|${slot.accept ?? ""}|${slot.required ? "1" : "0"}`,
      )
      .join("\n");
    form.active = item.active ? "true" : "false";
    form.order = String(item.order ?? 0);
    form.description = item.description ?? "";
  } catch {
    error.value = copy.validation.request;
  }
});

function payload() {
  const requiredDocuments = form.documents
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [key, label, accept, required] = line.split("|");
      return {
        key: key?.trim() ?? "",
        label: label?.trim() || key?.trim() || "",
        accept: accept?.trim() ?? "",
        required: required?.trim() !== "0",
      };
    })
    .filter((slot) => slot.key);
  return {
    title: form.title.trim(),
    price: Number(form.price),
    durationDays: Number(form.durationDays),
    benefits: form.benefits
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
    requiredDocuments,
    active: form.active === "true",
    order: Number(form.order || 0),
    description: form.description.trim(),
  };
}

async function save() {
  if (!form.title.trim()) {
    error.value = copy.validation.required;
    return;
  }
  pending.value = true;
  error.value = "";
  try {
    if (creating.value) {
      const created = await auth
        .api()
        .request<MembershipPlan>("/admin/membership-plans", {
          method: "POST",
          body: payload(),
        });
      await navigateTo(`/admin/plans/${recordId(created)}`);
    } else {
      await auth
        .api()
        .request(`/admin/membership-plans/${encodeURIComponent(props.planId)}`, {
          method: "PATCH",
          body: payload(),
        });
      message.value = copy.actions.save;
    }
  } catch (reason) {
    error.value = isApiError(reason)
      ? messageOf(reason.payload) || copy.validation.request
      : copy.validation.request;
  } finally {
    pending.value = false;
  }
}

async function remove() {
  if (creating.value || !window.confirm(copy.fields.deleteConfirm)) return;
  await auth
    .api()
    .request(`/admin/membership-plans/${encodeURIComponent(props.planId)}`, {
      method: "DELETE",
    });
  await navigateTo("/admin/plans");
}
</script>

<template>
  <form class="grid max-w-3xl gap-5" @submit.prevent="save">
    <h1 class="font-heading text-4xl text-primary">{{ copy.seo.planEditTitle }}</h1>
    <p class="text-sm text-secondary">
      {{ copy.fields.requiredDocuments }}: key|label|accept|1
    </p>
    <p v-if="error" class="text-accent" role="alert">{{ error }}</p>
    <p v-if="message" role="status">{{ message }}</p>
    <AccountField v-model="form.title" :label="copy.fields.title" required />
    <AccountField v-model="form.price" :label="copy.fields.price" required />
    <AccountField
      v-model="form.durationDays"
      :label="copy.fields.durationDays"
      required
    />
    <AccountField v-model="form.order" :label="copy.fields.order" />
    <AccountField v-model="form.description" :label="copy.fields.description" />
    <div class="grid gap-1">
      <label class="text-sm text-secondary" for="plan-benefits">{{
        copy.fields.benefits
      }}</label>
      <textarea
        id="plan-benefits"
        v-model="form.benefits"
        rows="5"
        class="border border-line bg-paper p-3"
      />
    </div>
    <div class="grid gap-1">
      <label class="text-sm text-secondary" for="plan-documents">{{
        copy.fields.requiredDocuments
      }}</label>
      <textarea
        id="plan-documents"
        v-model="form.documents"
        rows="5"
        class="border border-line bg-paper p-3"
        dir="ltr"
      />
    </div>
    <AccountSelect
      v-model="form.active"
      :label="copy.fields.active"
      :options="[
        { value: 'true', label: copy.fields.yes },
        { value: 'false', label: copy.fields.no },
      ]"
    />
    <div class="flex flex-wrap gap-3">
      <button
        class="button bg-primary px-4 py-2 text-paper"
        type="submit"
        :disabled="pending"
      >
        {{ copy.actions.save }}
      </button>
      <button v-if="!creating" type="button" class="button" @click="remove">
        {{ copy.actions.remove }}
      </button>
    </div>
  </form>
</template>
