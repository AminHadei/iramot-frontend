<script setup lang="ts">
import type { MembershipApplication } from "~/types/membership";
import { asPage } from "~/utils/pageResult";
import { recordId } from "~/utils/money";
import { loadPlans, planTitle } from "~/utils/membershipRead";

definePageMeta({ layout: "panel", middleware: "auth" });

const copy = await useAccountPage("applicationsTitle", "applicationsDescription");
const auth = useAuth();
const rows = ref<Array<Record<string, string>>>([]);
const error = ref("");

onMounted(async () => {
  try {
    const [body, plans] = await Promise.all([
      auth.api().request<unknown>("/membership-applications/my"),
      loadPlans(auth.api()).catch(() => []),
    ]);
    const items = Array.isArray(body)
      ? (body as MembershipApplication[])
      : asPage<MembershipApplication>(body).items;
    rows.value = items.map((item) => ({
      id: recordId(item),
      plan: planTitle(plans, item.planId, item.planTitle),
      status: copy.status[item.status] ?? item.status,
      href: `/panel/applications/${recordId(item)}`,
    }));
  } catch {
    error.value = copy.validation.request;
  }
});
</script>

<template>
  <div>
    <h1 class="font-heading text-4xl text-primary">{{ copy.seo.applicationsTitle }}</h1>
    <p v-if="error" class="mt-4 text-accent" role="alert">{{ error }}</p>
    <AccountTable
      class="mt-6"
      :empty="copy.fields.empty"
      :columns="[
        { key: 'plan', label: copy.fields.plan },
        { key: 'status', label: copy.fields.status },
        { key: 'open', label: copy.actions.edit },
      ]"
      :rows="rows"
    >
      <template #open="{ row }">
        <NuxtLink :to="row.href">{{ copy.actions.edit }}</NuxtLink>
      </template>
    </AccountTable>
  </div>
</template>
