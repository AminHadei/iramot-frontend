<script setup lang="ts">
import type {
  ApplicationFields,
  DiscountQuote,
  DocumentRequirement,
  MembershipApplication,
  MembershipPlan,
  PaymentStart,
} from "~/types/membership";
import type { PanelDocumentSlot } from "~/types/panel";
import { isApiError, messageOf } from "~/utils/apiError";
import { parseMemberDate } from "~/utils/jalali";
import { formatAmount, recordId } from "~/utils/money";
import { loadPlans, pendingPaymentKey } from "~/utils/membershipRead";
import {
  emailCode,
  englishDigits,
  isCompanyNationalId,
  isNationalCode,
  requiredCode,
} from "~/utils/validators";

definePageMeta({ layout: "panel", middleware: "auth" });

const copy = await useAccountPage("applyTitle", "applyDescription");
const auth = useAuth();
const route = useRoute();
const plan = ref<MembershipPlan | null>(null);
const applicationId = ref("");
const discountCode = ref("");
const quote = ref<DiscountQuote | null>(null);
const errors = reactive<Record<string, string>>({});
const formError = ref("");
const pending = ref(false);
const files = reactive<Record<string, { file: File; preview: string }>>({});
const maxBytes = 10 * 1024 * 1024;

const form = reactive({
  educationStatus: "masters_graduate",
  fieldOfStudy: "technology_management",
  firstName: auth.user.value?.firstName ?? "",
  lastName: auth.user.value?.lastName ?? "",
  phone: "",
  nationalCode: "",
  fatherName: "",
  birthDate: "",
  email: auth.user.value?.email ?? "",
  university: "",
  address: "",
  postalCode: "",
  companyName: "",
  fieldOfActivity: "",
  companyPhone: "",
  nationalId: "",
  ceoFullName: "",
  representativeName: "",
  representativePosition: "",
  representativePhone: "",
});

const legal = computed(() => plan.value?.personType === "legal");

const slots = computed<DocumentRequirement[]>(() => {
  const catalog = new Map<string, PanelDocumentSlot>();
  const primary = legal.value ? copy.documents.legal : copy.documents.natural;
  const secondary = legal.value ? copy.documents.natural : copy.documents.legal;
  for (const slot of [...secondary, ...primary]) catalog.set(slot.key, slot);
  const keys = plan.value?.requiredDocuments?.length
    ? plan.value.requiredDocuments
    : (legal.value ? copy.documents.legal : copy.documents.natural).map(
        (slot) => slot.key,
      );
  return keys.map((key) => {
    const slot = catalog.get(key);
    return {
      key,
      label: slot?.label || key,
      accept: slot?.accept,
      required: slot?.required ?? true,
    };
  });
});

const priceLabel = computed(() => {
  const base = plan.value?.price ?? 0;
  const finalPrice = quote.value?.valid ? (quote.value.finalPrice ?? base) : base;
  return `${formatAmount(finalPrice)} ${copy.fields.toman}`;
});

function assignApplication(item: MembershipApplication) {
  applicationId.value = recordId(item);
  const fields = form as Record<string, string | undefined>;
  for (const key of Object.keys(fields)) {
    const value = item[key as keyof MembershipApplication];
    if (typeof value === "string") fields[key] = value;
  }
}

onMounted(async () => {
  const requested = String(route.query.application ?? "");
  const planId = String(route.query.plan ?? "");
  try {
    const plans = await loadPlans(auth.api());
    if (requested) {
      const item = await auth
        .api()
        .request<MembershipApplication>(
          `/membership-applications/${encodeURIComponent(requested)}`,
        );
      assignApplication(item);
      plan.value = plans.find((entry) => entry.id === item.planId) ?? null;
      return;
    }
    plan.value = plans.find((entry) => entry.id === planId) ?? null;
  } catch {
    formError.value = copy.validation.request;
  }
});

function setError(key: string, invalid: boolean, code: string) {
  errors[key] = invalid ? copy.validation[code] || copy.validation.required : "";
}

function validate() {
  if (legal.value) {
    setError("companyName", Boolean(requiredCode(form.companyName ?? "")), "required");
    setError(
      "nationalId",
      !isCompanyNationalId(form.nationalId ?? ""),
      form.nationalId ? "companyId" : "required",
    );
    setError("ceoFullName", Boolean(requiredCode(form.ceoFullName ?? "")), "required");
    setError(
      "representativeName",
      Boolean(requiredCode(form.representativeName ?? "")),
      "required",
    );
    setError(
      "fieldOfActivity",
      Boolean(requiredCode(form.fieldOfActivity ?? "")),
      "required",
    );
    setError("email", Boolean(emailCode(form.email ?? "")), "email");
  } else {
    setError("firstName", Boolean(requiredCode(form.firstName ?? "")), "required");
    setError("lastName", Boolean(requiredCode(form.lastName ?? "")), "required");
    setError("fatherName", Boolean(requiredCode(form.fatherName ?? "")), "required");
    setError(
      "nationalCode",
      !isNationalCode(form.nationalCode ?? ""),
      form.nationalCode ? "nationalCode" : "required",
    );
    setError(
      "birthDate",
      !parseMemberDate(form.birthDate ?? ""),
      form.birthDate ? "date" : "required",
    );
    setError("email", Boolean(emailCode(form.email ?? "")), "email");
    setError("address", Boolean(requiredCode(form.address ?? "")), "required");
  }
  for (const slot of slots.value) {
    if (slot.required && !files[slot.key])
      errors[`file-${slot.key}`] = copy.validation.required;
    else if (!errors[`file-${slot.key}`]) errors[`file-${slot.key}`] = "";
  }
  return !Object.values(errors).some(Boolean);
}

function onFile(key: string, accept: string, file: File | null) {
  if (!file) return;
  if (file.size > maxBytes) {
    errors[`file-${key}`] = copy.validation.fileSize;
    return;
  }
  const allowed = accept.split(",").map((item) => item.trim());
  const ok = allowed.some(
    (type) =>
      file.type === type ||
      (type.endsWith("/*") && file.type.startsWith(type.slice(0, -1))),
  );
  if (accept && !ok) {
    errors[`file-${key}`] = copy.validation.fileType;
    return;
  }
  errors[`file-${key}`] = "";
  if (files[key]?.preview) URL.revokeObjectURL(files[key].preview);
  const preview = file.type.startsWith("image/") ? URL.createObjectURL(file) : "";
  files[key] = { file, preview };
}

async function applyDiscount() {
  if (!plan.value) return;
  quote.value = null;
  try {
    const body = await auth.api().request<DiscountQuote>("/discount-codes/validate", {
      method: "POST",
      body: {
        code: discountCode.value.trim(),
        planId: plan.value.id,
        originalPrice: plan.value.price,
      },
    });
    quote.value = body;
    errors.discount = body.valid ? "" : body.message || copy.validation.discount;
  } catch {
    errors.discount = copy.validation.discount;
  }
}

function updateBody(): ApplicationFields {
  if (legal.value) {
    return {
      companyName: form.companyName?.trim(),
      fieldOfActivity: form.fieldOfActivity?.trim(),
      companyPhone: form.companyPhone?.trim(),
      nationalId: englishDigits(form.nationalId ?? ""),
      ceoFullName: form.ceoFullName?.trim(),
      representativeName: form.representativeName?.trim(),
      representativePosition: form.representativePosition?.trim(),
      representativePhone: form.representativePhone?.trim(),
      email: form.email?.trim(),
      address: form.address?.trim(),
      postalCode: englishDigits(form.postalCode ?? ""),
    };
  }
  return {
    educationStatus: form.educationStatus,
    fieldOfStudy: form.fieldOfStudy,
    firstName: form.firstName?.trim(),
    lastName: form.lastName?.trim(),
    phone: form.phone?.trim(),
    nationalCode: englishDigits(form.nationalCode ?? ""),
    fatherName: form.fatherName?.trim(),
    birthDate: parseMemberDate(form.birthDate ?? "") ?? undefined,
    email: form.email?.trim(),
    university: form.university?.trim(),
    address: form.address?.trim(),
    postalCode: englishDigits(form.postalCode ?? ""),
  };
}

async function submit() {
  formError.value = "";
  if (!plan.value) {
    formError.value = copy.fields.choosePlan;
    return;
  }
  if (!validate()) {
    formError.value = copy.validation.form;
    return;
  }
  pending.value = true;
  try {
    let id = applicationId.value;
    if (!id) {
      const created = await auth
        .api()
        .request<MembershipApplication>("/membership-applications", {
          method: "POST",
          body: { planId: plan.value.id },
        });
      id = recordId(created);
      applicationId.value = id;
    }
    await auth.api().request(`/membership-applications/${id}`, {
      method: "PUT",
      body: updateBody(),
    });
    for (const [key, entry] of Object.entries(files)) {
      const data = new FormData();
      data.set("file", entry.file);
      await auth.api().request(`/membership-applications/${id}/upload/${key}`, {
        method: "POST",
        body: data,
      });
    }
    await auth.api().request(`/membership-applications/${id}/submit`, {
      method: "POST",
      body: {},
    });
    const payment = await auth.api().request<PaymentStart>("/payments", {
      method: "POST",
      body: {
        applicationId: id,
        discountCode: quote.value?.valid ? discountCode.value.trim() : undefined,
      },
    });
    sessionStorage.setItem(pendingPaymentKey, payment.paymentId);
    if (payment.redirectUrl) {
      window.location.assign(payment.redirectUrl);
      return;
    }
    await navigateTo("/panel/membership/return");
  } catch (error) {
    formError.value = isApiError(error)
      ? messageOf(error.payload) || copy.validation.request
      : copy.validation.request;
  } finally {
    pending.value = false;
  }
}

onBeforeUnmount(() => {
  for (const entry of Object.values(files)) {
    if (entry.preview) URL.revokeObjectURL(entry.preview);
  }
});
</script>

<template>
  <div>
    <h1 class="font-heading text-4xl text-primary">{{ copy.seo.applyTitle }}</h1>
    <p v-if="!plan" class="mt-4">
      {{ copy.fields.choosePlan }}
      <NuxtLink to="/panel/membership">{{ copy.nav.membership }}</NuxtLink>
    </p>
    <form v-else class="mt-8 grid max-w-3xl gap-5" @submit.prevent="submit">
      <p class="text-lg">{{ plan.title }} — {{ priceLabel }}</p>
      <p class="text-sm text-secondary">
        {{ legal ? copy.fields.legal : copy.fields.natural }}
      </p>
      <p v-if="formError" class="text-accent" role="alert">{{ formError }}</p>
      <template v-if="!legal">
        <AccountSelect
          v-model="form.educationStatus"
          :label="copy.fields.educationStatus"
          :options="[
            { value: 'masters_graduate', label: copy.fields.mastersGraduate },
            { value: 'phd_student', label: copy.fields.phdStudent },
            { value: 'phd_graduate', label: copy.fields.phdGraduate },
            { value: 'other', label: copy.fields.other },
          ]"
        />
        <AccountSelect
          v-model="form.fieldOfStudy"
          :label="copy.fields.fieldOfStudy"
          :options="[
            { value: 'technology_management', label: copy.fields.studyTechnology },
            { value: 'science_technology_policy', label: copy.fields.studyPolicy },
            { value: 'entrepreneurship', label: copy.fields.studyEntrepreneurship },
            { value: 'futures_studies', label: copy.fields.studyFutures },
            { value: 'other_related', label: copy.fields.studyOther },
          ]"
        />
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
          v-model="form.fatherName"
          :label="copy.fields.fatherName"
          :error="errors.fatherName"
          required
        />
        <AccountField
          v-model="form.nationalCode"
          :label="copy.fields.nationalCode"
          :error="errors.nationalCode"
          required
        />
        <AccountField
          v-model="form.birthDate"
          :label="copy.fields.birthDate"
          :error="errors.birthDate"
          :hint="copy.hints.birthDate"
          required
        />
        <AccountField
          v-model="form.email"
          :label="copy.auth.email"
          :error="errors.email"
          type="email"
        />
        <AccountField v-model="form.phone" :label="copy.fields.phone" />
        <AccountField v-model="form.university" :label="copy.fields.university" />
        <AccountField
          v-model="form.address"
          :label="copy.fields.address"
          :error="errors.address"
          required
        />
        <AccountField v-model="form.postalCode" :label="copy.fields.postalCode" />
      </template>
      <template v-else>
        <AccountField
          v-model="form.companyName"
          :label="copy.fields.companyName"
          :error="errors.companyName"
          required
        />
        <AccountField
          v-model="form.nationalId"
          :label="copy.fields.nationalId"
          :error="errors.nationalId"
          required
        />
        <AccountField
          v-model="form.fieldOfActivity"
          :label="copy.fields.fieldOfActivity"
          :error="errors.fieldOfActivity"
          required
        />
        <AccountField v-model="form.companyPhone" :label="copy.fields.companyPhone" />
        <AccountField
          v-model="form.ceoFullName"
          :label="copy.fields.ceoFullName"
          :error="errors.ceoFullName"
          required
        />
        <AccountField
          v-model="form.representativeName"
          :label="copy.fields.representativeName"
          :error="errors.representativeName"
          required
        />
        <AccountField
          v-model="form.representativePosition"
          :label="copy.fields.representativePosition"
        />
        <AccountField
          v-model="form.representativePhone"
          :label="copy.fields.representativePhone"
        />
        <AccountField
          v-model="form.email"
          :label="copy.auth.email"
          :error="errors.email"
          type="email"
        />
        <AccountField v-model="form.address" :label="copy.fields.address" />
        <AccountField v-model="form.postalCode" :label="copy.fields.postalCode" />
      </template>
      <div class="grid gap-3">
        <h2 class="text-xl text-primary">{{ copy.fields.documents }}</h2>
        <AccountFile
          v-for="slot in slots"
          :key="slot.key"
          :label="slot.label"
          :choose-label="copy.actions.upload"
          :accept="slot.accept || ''"
          :required="slot.required"
          :file-name="files[slot.key]?.file.name"
          :preview="files[slot.key]?.preview"
          :max-hint="copy.fields.maxSize"
          :error="errors[`file-${slot.key}`]"
          @select="onFile(slot.key, slot.accept || '', $event)"
        />
      </div>
      <div class="grid gap-3">
        <AccountField
          v-model="discountCode"
          :label="copy.fields.discount"
          :error="errors.discount"
        />
        <button type="button" class="button" @click="applyDiscount">
          {{ copy.actions.applyDiscount }}
        </button>
        <p v-if="quote?.valid">
          {{ copy.fields.discountAmount }}: {{ formatAmount(quote.discountAmount) }}
          {{ copy.fields.toman }}
        </p>
        <p>{{ copy.fields.finalPrice }}: {{ priceLabel }}</p>
      </div>
      <button
        class="button bg-primary px-4 py-2 text-paper"
        type="submit"
        :disabled="pending"
      >
        {{ copy.actions.pay }}
      </button>
    </form>
  </div>
</template>
