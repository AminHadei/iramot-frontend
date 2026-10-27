<script setup lang="ts">
import type { MembershipApplication } from "~/types/membership";
import { isApiError, messageOf } from "~/utils/apiError";
import { formatAmount } from "~/utils/money";

definePageMeta({ layout: "panel", middleware: "admin" });

const copy = await useAccountPage("reviewTitle", "reviewDescription");
const auth = useAuth();
const route = useRoute();
const item = ref<MembershipApplication | null>(null);
const reason = ref("");
const error = ref("");
const message = ref("");
const pending = ref(false);
const id = computed(() => String(route.params.id ?? ""));

const details = computed(() => {
  const source =
    item.value?.personType === "legal" ? item.value?.legal : item.value?.natural;
  if (!source) return [];
  return Object.entries(source).filter(([, value]) => value);
});

async function load() {
  item.value = await auth
    .api()
    .request<MembershipApplication>(
      `/admin/applications/${encodeURIComponent(id.value)}`,
    );
}

onMounted(async () => {
  try {
    await load();
  } catch {
    error.value = copy.validation.request;
  }
});

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
      .request(`/admin/applications/${encodeURIComponent(id.value)}/${kind}`, {
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
      <p>{{ copy.fields.plan }}: {{ item.planTitle || item.planId }}</p>
      <p>
        {{ copy.fields.finalPrice }}: {{ formatAmount(item.finalPrice ?? item.price) }}
        {{ copy.fields.rial }}
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
        <li
          v-for="document in item.documents || []"
          :key="document.url"
          class="border border-line p-3"
        >
          <a :href="document.url" target="_blank" rel="noopener noreferrer">
            {{ document.name || document.key }}
          </a>
          <img
            v-if="
              document.contentType?.startsWith('image/') ||
              /\.(png|jpe?g|webp|gif)$/i.test(document.url)
            "
            :src="document.url"
            alt=""
            class="mt-3 max-h-80 max-w-full object-contain"
          />
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
