<script setup lang="ts">
import type { MembershipPlan } from "~/types/membership";
import { isApiError, messageOf } from "~/utils/apiError";
import { recordId } from "~/utils/money";

const props = defineProps<{ planId: string }>();

const copy = await useAccountPage("planEditTitle", "planEditDescription");
const auth = useAuth();
const form = reactive({
  title: "",
  category: "regular",
  personType: "natural",
  price: "",
  durationMonths: "12",
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
      .request<MembershipPlan>(`/membership-plans/${encodeURIComponent(props.planId)}`);
    form.title = item.title ?? "";
    form.category = item.category || "regular";
    form.personType = item.personType || "natural";
    form.price = String(item.price ?? "");
    form.durationMonths = String(item.durationMonths ?? "");
    form.benefits = (item.benefits ?? []).join("\n");
    form.documents = (item.requiredDocuments ?? []).join("\n");
    form.active = item.isActive ? "true" : "false";
    form.order = String(item.sortOrder ?? 0);
    form.description = item.description ?? "";
  } catch {
    error.value = copy.validation.request;
  }
});

function payload() {
  return {
    title: form.title.trim(),
    category: form.category,
    personType: form.personType,
    price: Number(form.price),
    durationMonths: Number(form.durationMonths),
    benefits: form.benefits
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
    requiredDocuments: form.documents
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
    isActive: form.active === "true",
    sortOrder: Number(form.order || 0),
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
      const created = await auth.api().request<MembershipPlan>("/membership-plans", {
        method: "POST",
        body: payload(),
      });
      await navigateTo(`/admin/plans/${recordId(created)}`);
    } else {
      await auth
        .api()
        .request(`/membership-plans/${encodeURIComponent(props.planId)}`, {
          method: "PUT",
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
  await auth.api().request(`/membership-plans/${encodeURIComponent(props.planId)}`, {
    method: "DELETE",
  });
  await navigateTo("/admin/plans");
}
</script>

<template>
  <form class="grid max-w-3xl gap-5" @submit.prevent="save">
    <h1 class="font-heading text-4xl text-primary">{{ copy.seo.planEditTitle }}</h1>
    <p class="text-sm text-secondary">
      personnel_photo, latest_degree, student_card, resume, company_logo
    </p>
    <p v-if="error" class="text-accent" role="alert">{{ error }}</p>
    <p v-if="message" role="status">{{ message }}</p>
    <AccountField v-model="form.title" :label="copy.fields.title" required />
    <AccountSelect
      v-model="form.category"
      :label="copy.fields.category"
      :options="[
        { value: 'regular', label: copy.fields.categoryRegular },
        { value: 'associate', label: copy.fields.categoryAssociate },
        { value: 'student', label: copy.fields.categoryStudent },
        { value: 'legal_entity', label: copy.fields.categoryLegal },
        { value: 'honorary', label: copy.fields.categoryHonorary },
      ]"
    />
    <AccountSelect
      v-model="form.personType"
      :label="copy.fields.personType"
      :options="[
        { value: 'natural', label: copy.fields.natural },
        { value: 'legal', label: copy.fields.legal },
      ]"
    />
    <AccountField
      v-model="form.price"
      :label="`${copy.fields.price} (${copy.fields.toman})`"
      required
    />
    <AccountField
      v-model="form.durationMonths"
      :label="copy.fields.durationMonths"
      required
    />
    <AccountField v-model="form.order" :label="copy.fields.sortOrder" />
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
