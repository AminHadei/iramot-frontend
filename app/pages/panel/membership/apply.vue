<script setup lang="ts">
import type {
  DiscountQuote,
  DocumentRequirement,
  LegalApplication,
  MembershipApplication,
  MembershipPlan,
  NaturalApplication,
  PersonType,
} from "~/types/membership";
import type { PanelDocumentSlot } from "~/types/panel";
import { isApiError, messageOf } from "~/utils/apiError";
import { parseMemberDate } from "~/utils/jalali";
import { formatAmount, recordId } from "~/utils/money";
import { withBase } from "~/utils/withBase";
import {
  emailCode,
  englishDigits,
  isCompanyNationalId,
  isIranMobile,
  isNationalCode,
  normalizeIranMobile,
  requiredCode,
} from "~/utils/validators";

definePageMeta({ layout: "panel", middleware: "auth" });

const copy = await useAccountPage("applyTitle", "applyDescription");
const auth = useAuth();
const route = useRoute();
const config = useRuntimeConfig();
const plan = ref<MembershipPlan | null>(null);
const personType = ref<PersonType>("natural");
const discountCode = ref("");
const quote = ref<DiscountQuote | null>(null);
const errors = reactive<Record<string, string>>({});
const formError = ref("");
const pending = ref(false);
const files = reactive<Record<string, { file: File; preview: string }>>({});

const natural = reactive<NaturalApplication>({
  firstName: auth.user.value?.firstName ?? "",
  lastName: auth.user.value?.lastName ?? "",
  fatherName: "",
  nationalCode: "",
  birthDate: "",
  gender: "female",
  mobile: auth.user.value?.mobile ?? "",
  email: auth.user.value?.email ?? "",
  phone: "",
  educationLevel: "",
  fieldOfStudy: "",
  university: "",
  jobTitle: "",
  organization: "",
  province: "",
  city: "",
  address: "",
  postalCode: "",
});

const legal = reactive<LegalApplication>({
  organizationName: "",
  organizationType: "private",
  nationalId: "",
  registrationNumber: "",
  economicCode: "",
  establishedAt: "",
  ceoName: "",
  representativeFirstName: "",
  representativeLastName: "",
  representativeNationalCode: "",
  representativeRole: "",
  representativeMobile: "",
  email: "",
  phone: "",
  website: "",
  activity: "",
  province: "",
  city: "",
  address: "",
  postalCode: "",
});

const slots = computed<DocumentRequirement[]>(() => {
  const fromPlan = plan.value?.requiredDocuments ?? [];
  if (fromPlan.length) return fromPlan;
  const fallback =
    personType.value === "legal" ? copy.documents.legal : copy.documents.natural;
  return fallback.map((slot: PanelDocumentSlot) => ({
    key: slot.key,
    label: slot.label,
    accept: slot.accept,
    required: slot.required,
  }));
});

const priceLabel = computed(() => {
  const base = plan.value?.price ?? 0;
  const finalPrice = quote.value?.valid ? (quote.value.finalPrice ?? base) : base;
  return `${formatAmount(finalPrice)} ${copy.fields.rial}`;
});

onMounted(async () => {
  const planId = String(route.query.plan ?? "");
  if (!planId) return;
  try {
    const body = await auth
      .api()
      .request<MembershipPlan[] | { items: MembershipPlan[] }>("/membership/plans");
    const items = Array.isArray(body) ? body : body.items;
    plan.value = items.find((item) => String(item.id) === planId) ?? null;
  } catch {
    formError.value = copy.validation.request;
  }
});

function setError(key: string, invalid: boolean, code: string) {
  errors[key] = invalid ? copy.validation[code] || copy.validation.required : "";
}

function validate() {
  if (personType.value === "natural") {
    setError("firstName", Boolean(requiredCode(natural.firstName)), "required");
    setError("lastName", Boolean(requiredCode(natural.lastName)), "required");
    setError("fatherName", Boolean(requiredCode(natural.fatherName)), "required");
    setError(
      "nationalCode",
      !isNationalCode(natural.nationalCode),
      natural.nationalCode ? "nationalCode" : "required",
    );
    setError(
      "birthDate",
      !parseMemberDate(natural.birthDate),
      natural.birthDate ? "date" : "required",
    );
    setError(
      "mobile",
      !isIranMobile(natural.mobile),
      natural.mobile ? "mobile" : "required",
    );
    setError("email", Boolean(emailCode(natural.email)), "email");
    setError("address", Boolean(requiredCode(natural.address)), "required");
  } else {
    setError(
      "organizationName",
      Boolean(requiredCode(legal.organizationName)),
      "required",
    );
    setError(
      "nationalId",
      !isCompanyNationalId(legal.nationalId),
      legal.nationalId ? "companyId" : "required",
    );
    setError(
      "representativeFirstName",
      Boolean(requiredCode(legal.representativeFirstName)),
      "required",
    );
    setError(
      "representativeLastName",
      Boolean(requiredCode(legal.representativeLastName)),
      "required",
    );
    setError(
      "representativeNationalCode",
      !isNationalCode(legal.representativeNationalCode),
      legal.representativeNationalCode ? "nationalCode" : "required",
    );
    setError(
      "representativeMobile",
      !isIranMobile(legal.representativeMobile),
      legal.representativeMobile ? "mobile" : "required",
    );
    setError("address", Boolean(requiredCode(legal.address)), "required");
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
  if (file.size > 8 * 1024 * 1024) {
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
    const body = await auth
      .api()
      .request<DiscountQuote>("/membership/discount-codes/validate", {
        method: "POST",
        body: { code: discountCode.value.trim(), planId: plan.value.id },
      });
    quote.value = body;
    if (!body.valid) errors.discount = body.message || copy.validation.discount;
    else errors.discount = "";
  } catch {
    errors.discount = copy.validation.discount;
  }
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
    const naturalBody = {
      ...natural,
      mobile: normalizeIranMobile(natural.mobile),
      nationalCode: englishDigits(natural.nationalCode),
      birthDate: parseMemberDate(natural.birthDate),
    };
    const legalBody = {
      ...legal,
      nationalId: englishDigits(legal.nationalId),
      representativeNationalCode: englishDigits(legal.representativeNationalCode),
      representativeMobile: normalizeIranMobile(legal.representativeMobile),
      establishedAt: legal.establishedAt ? parseMemberDate(legal.establishedAt) : "",
    };
    const created = await auth
      .api()
      .request<MembershipApplication>("/membership/applications", {
        method: "POST",
        body: {
          planId: plan.value.id,
          personType: personType.value,
          discountCode: quote.value?.valid ? discountCode.value.trim() : undefined,
          natural: personType.value === "natural" ? naturalBody : undefined,
          legal: personType.value === "legal" ? legalBody : undefined,
        },
      });
    const id = recordId(created);
    for (const [key, entry] of Object.entries(files)) {
      const form = new FormData();
      form.set("file", entry.file);
      form.set("key", key);
      await auth.api().request(`/membership/applications/${id}/documents`, {
        method: "POST",
        body: form,
      });
    }
    const returnUrl = new URL(
      withBase(config.app.baseURL, "/panel/membership/return"),
      window.location.origin,
    ).href;
    const payment = await auth
      .api()
      .request<{ redirectUrl?: string }>(`/membership/applications/${id}/pay`, {
        method: "POST",
        body: { returnUrl },
      });
    if (payment.redirectUrl) {
      window.location.assign(payment.redirectUrl);
      return;
    }
    await navigateTo(`/panel/applications/${id}`);
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
      <p v-if="formError" class="text-accent" role="alert">{{ formError }}</p>
      <AccountSelect
        v-model="personType"
        :label="copy.fields.personType"
        :options="[
          { value: 'natural', label: copy.fields.natural },
          { value: 'legal', label: copy.fields.legal },
        ]"
      />
      <template v-if="personType === 'natural'">
        <AccountField
          v-model="natural.firstName"
          :label="copy.auth.firstName"
          :error="errors.firstName"
          required
        />
        <AccountField
          v-model="natural.lastName"
          :label="copy.auth.lastName"
          :error="errors.lastName"
          required
        />
        <AccountField
          v-model="natural.fatherName"
          :label="copy.fields.fatherName"
          :error="errors.fatherName"
          required
        />
        <AccountField
          v-model="natural.nationalCode"
          :label="copy.fields.nationalCode"
          :error="errors.nationalCode"
          required
        />
        <AccountField
          v-model="natural.birthDate"
          :label="copy.fields.birthDate"
          :error="errors.birthDate"
          :hint="copy.hints.birthDate"
          required
        />
        <AccountSelect
          v-model="natural.gender"
          :label="copy.fields.gender"
          :options="[
            { value: 'female', label: copy.fields.female },
            { value: 'male', label: copy.fields.male },
            { value: 'other', label: copy.fields.other },
          ]"
        />
        <AccountField
          v-model="natural.mobile"
          :label="copy.auth.mobile"
          :error="errors.mobile"
          :hint="copy.hints.mobile"
          required
        />
        <AccountField
          v-model="natural.email"
          :label="copy.auth.email"
          :error="errors.email"
          type="email"
        />
        <AccountField v-model="natural.phone" :label="copy.fields.phone" />
        <AccountField
          v-model="natural.educationLevel"
          :label="copy.fields.educationLevel"
        />
        <AccountField
          v-model="natural.fieldOfStudy"
          :label="copy.fields.fieldOfStudy"
        />
        <AccountField v-model="natural.university" :label="copy.fields.university" />
        <AccountField v-model="natural.jobTitle" :label="copy.fields.jobTitle" />
        <AccountField
          v-model="natural.organization"
          :label="copy.fields.organization"
        />
        <AccountField v-model="natural.province" :label="copy.fields.province" />
        <AccountField v-model="natural.city" :label="copy.fields.city" />
        <AccountField
          v-model="natural.address"
          :label="copy.fields.address"
          :error="errors.address"
          required
        />
        <AccountField v-model="natural.postalCode" :label="copy.fields.postalCode" />
      </template>
      <template v-else>
        <AccountField
          v-model="legal.organizationName"
          :label="copy.fields.organizationName"
          :error="errors.organizationName"
          required
        />
        <AccountSelect
          v-model="legal.organizationType"
          :label="copy.fields.organizationType"
          :options="[
            { value: 'governmental', label: copy.fields.governmental },
            { value: 'private', label: copy.fields.private },
            { value: 'cooperative', label: copy.fields.cooperative },
            { value: 'public', label: copy.fields.public },
            { value: 'other', label: copy.fields.other },
          ]"
        />
        <AccountField
          v-model="legal.nationalId"
          :label="copy.fields.nationalId"
          :error="errors.nationalId"
          required
        />
        <AccountField
          v-model="legal.registrationNumber"
          :label="copy.fields.registrationNumber"
        />
        <AccountField v-model="legal.economicCode" :label="copy.fields.economicCode" />
        <AccountField
          v-model="legal.establishedAt"
          :label="copy.fields.establishedAt"
          :hint="copy.hints.birthDate"
        />
        <AccountField v-model="legal.ceoName" :label="copy.fields.ceoName" />
        <AccountField
          v-model="legal.representativeFirstName"
          :label="copy.fields.representativeFirstName"
          :error="errors.representativeFirstName"
          required
        />
        <AccountField
          v-model="legal.representativeLastName"
          :label="copy.fields.representativeLastName"
          :error="errors.representativeLastName"
          required
        />
        <AccountField
          v-model="legal.representativeNationalCode"
          :label="copy.fields.representativeNationalCode"
          :error="errors.representativeNationalCode"
          required
        />
        <AccountField
          v-model="legal.representativeRole"
          :label="copy.fields.representativeRole"
        />
        <AccountField
          v-model="legal.representativeMobile"
          :label="copy.fields.representativeMobile"
          :error="errors.representativeMobile"
          required
        />
        <AccountField v-model="legal.email" :label="copy.auth.email" type="email" />
        <AccountField v-model="legal.phone" :label="copy.fields.phone" />
        <AccountField v-model="legal.website" :label="copy.fields.website" />
        <AccountField v-model="legal.activity" :label="copy.fields.activity" />
        <AccountField v-model="legal.province" :label="copy.fields.province" />
        <AccountField v-model="legal.city" :label="copy.fields.city" />
        <AccountField
          v-model="legal.address"
          :label="copy.fields.address"
          :error="errors.address"
          required
        />
        <AccountField v-model="legal.postalCode" :label="copy.fields.postalCode" />
      </template>
      <div class="grid gap-3">
        <h2 class="text-xl text-primary">{{ copy.fields.documents }}</h2>
        <AccountFile
          v-for="slot in slots"
          :key="slot.key"
          :label="slot.label"
          :accept="slot.accept || ''"
          :required="slot.required"
          :file-name="files[slot.key]?.file.name"
          :preview="files[slot.key]?.preview"
          :max-hint="copy.fields.maxSize"
          :error="errors[`file-${slot.key}`]"
          @select="onFile(slot.key, slot.accept || '', $event)"
        />
      </div>
      <div class="grid gap-3 border border-line p-4">
        <AccountField
          v-model="discountCode"
          :label="copy.fields.discount"
          :error="errors.discount"
        />
        <button type="button" class="button" @click="applyDiscount">
          {{ copy.actions.applyDiscount }}
        </button>
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
