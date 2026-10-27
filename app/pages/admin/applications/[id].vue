<script setup lang="ts">
import type { MembershipApplication, MembershipPlan } from "~/types/membership";
import { isApiError, messageOf } from "~/utils/apiError";
import { loadPlans, planTitle } from "~/utils/membershipRead";

definePageMeta({ layout: "panel", middleware: "admin" });

const copy = await useAccountPage("reviewTitle", "reviewDescription");
const auth = useAuth();
const route = useRoute();
const item = ref<MembershipApplication | null>(null);
const plans = ref<MembershipPlan[]>([]);
const reason = ref("");
const error = ref("");
const message = ref("");
const pending = ref(false);
const id = computed(() => String(route.params.id ?? ""));

const fieldKeys = [
  "educationStatus",
  "fieldOfStudy",
  "firstName",
  "lastName",
  "fatherName",
  "nationalCode",
  "birthDate",
  "phone",
  "email",
  "university",
  "address",
  "postalCode",
  "companyName",
  "fieldOfActivity",
  "companyPhone",
  "nationalId",
  "ceoFullName",
  "representativeName",
  "representativePosition",
  "representativePhone",
] as const;

const details = computed(() => {
  const rows: Array<[string, string]> = [];
  if (!item.value) return rows;
  for (const key of fieldKeys) {
    const value = item.value[key];
    if (typeof value === "string" && value) rows.push([key, value]);
  }
  return rows;
});

const documents = computed(() => Object.keys(item.value?.documents ?? {}));
const title = computed(() =>
  item.value ? planTitle(plans.value, item.value.planId, item.value.planTitle) : "",
);

async function load() {
  const [application, loaded] = await Promise.all([
    auth
      .api()
      .request<MembershipApplication>(
        `/membership-applications/${encodeURIComponent(id.value)}`,
      ),
    loadPlans(auth.api()).catch(() => [] as MembershipPlan[]),
  ]);
  item.value = application;
  plans.value = loaded;
}

onMounted(async () => {
  try {
    await load();
  } catch {
    error.value = copy.validation.request;
  }
});

async function download(documentType: string) {
  const blob = await auth
    .api()
    .request<Blob>(
      `/membership-applications/${encodeURIComponent(id.value)}/documents/${encodeURIComponent(documentType)}`,
      { raw: true },
    );
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = documentType;
  link.click();
  URL.revokeObjectURL(url);
}

async function decide(kind: "approve" | "reject") {
  if (kind === "reject" && !reason.value.trim()) {
    error.value = copy.validation.required;
    return;
  }
  pending.value = true;
  error.value = "";
  try {
    await auth
      .api()
      .request(`/membership-applications/${encodeURIComponent(id.value)}/${kind}`, {
        method: "POST",
        body: kind === "reject" ? { reason: reason.value.trim() } : {},
      });
    message.value = kind === "approve" ? copy.actions.approve : copy.actions.reject;
    await load();
  } catch (reasonError) {
    error.value = isApiError(reasonError)
      ? messageOf(reasonError.payload) || copy.validation.request
      : copy.validation.request;
  } finally {
    pending.value = false;
  }
}
</script>

<template>
  <div>
    <h1 class="font-heading text-4xl text-primary">{{ copy.seo.reviewTitle }}</h1>
    <p v-if="error" class="mt-4 text-accent" role="alert">{{ error }}</p>
    <p v-if="message" class="mt-4" role="status">{{ message }}</p>
    <div v-if="item" class="mt-6 grid gap-4">
      <p>{{ copy.fields.status }}: {{ copy.status[item.status] ?? item.status }}</p>
      <p>{{ copy.fields.plan }}: {{ title }}</p>
      <p v-if="item.membershipNumber">
        {{ copy.fields.membershipNumber }}: {{ item.membershipNumber }}
      </p>
      <p v-if="item.rejectionReason">
        {{ copy.fields.rejection }}: {{ item.rejectionReason }}
      </p>
      <dl class="grid gap-2">
        <div v-for="[key, value] in details" :key="key">
          <dt class="text-sm text-secondary">
            {{ copy.fields[key] || copy.auth[key] || key }}
          </dt>
          <dd>{{ value }}</dd>
        </div>
      </dl>
      <h2 class="text-xl text-primary">{{ copy.fields.documents }}</h2>
      <ul class="m-0 grid list-none gap-3 p-0">
        <li v-for="documentType in documents" :key="documentType">
          <button type="button" class="button" @click="download(documentType)">
            {{ documentType }}
          </button>
        </li>
      </ul>
      <AccountField v-model="reason" :label="copy.fields.reason" />
      <div class="flex flex-wrap gap-3">
        <button
          type="button"
          class="button bg-primary px-4 py-2 text-paper"
          :disabled="pending"
          @click="decide('approve')"
        >
          {{ copy.actions.approve }}
        </button>
        <button
          type="button"
          class="button"
          :disabled="pending"
          @click="decide('reject')"
        >
          {{ copy.actions.reject }}
        </button>
      </div>
    </div>
  </div>
</template>
