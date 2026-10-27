<script setup lang="ts">
import type { MembershipApplication, MembershipPlan } from "~/types/membership";
import { asPage } from "~/utils/pageResult";
import { recordId } from "~/utils/money";
import { loadPlans, planTitle } from "~/utils/membershipRead";

definePageMeta({ layout: "panel", middleware: "admin" });

const copy = await useAccountPage("queueTitle", "queueDescription");
const auth = useAuth();
const route = useRoute();
const router = useRouter();
const status = ref(String(route.query.status ?? "pending_review"));
const rows = ref<Array<Record<string, string>>>([]);
const error = ref("");

async function load() {
  error.value = "";
  try {
    const queued = !status.value || status.value === "pending_review";
    const [body, plans] = await Promise.all([
      auth
        .api()
        .request<unknown>(
          queued ? "/admin/membership/queue" : "/admin/membership/applications",
          { query: queued ? undefined : { status: status.value } },
        ),
      loadPlans(auth.api()).catch(() => [] as MembershipPlan[]),
    ]);
    const items = Array.isArray(body)
      ? (body as MembershipApplication[])
      : asPage<MembershipApplication>(body).items;
    rows.value = items.map((item) => {
      const plan = plans.find((entry) => entry.id === item.planId);
      return {
        id: recordId(item),
        title: planTitle(plans, item.planId, item.planTitle),
        person: plan?.personType === "legal" ? copy.fields.legal : copy.fields.natural,
        status: copy.status[item.status] ?? item.status,
        href: `/admin/applications/${recordId(item)}`,
      };
    });
  } catch {
    error.value = copy.validation.request;
  }
}

async function filter() {
  await router.replace({ query: { status: status.value } });
  await load();
}

onMounted(load);
</script>

<template>
  <div>
    <h1 class="font-heading text-4xl text-primary">{{ copy.seo.queueTitle }}</h1>
    <AdminFilterBar :label="copy.actions.filter" @submit="filter">
      <AccountSelect
        v-model="status"
        :label="copy.fields.status"
        :options="[
          { value: 'pending_review', label: copy.status.pending_review },
          { value: 'pending_payment', label: copy.status.pending_payment },
          { value: 'approved', label: copy.status.approved },
          { value: 'rejected', label: copy.status.rejected },
          { value: 'draft', label: copy.status.draft },
          { value: 'expired', label: copy.status.expired },
        ]"
      />
    </AdminFilterBar>
    <p v-if="error" class="mt-4 text-accent" role="alert">{{ error }}</p>
    <AccountTable
      class="mt-6"
      :empty="copy.fields.queueEmpty"
      :columns="[
        { key: 'title', label: copy.fields.plan },
        { key: 'person', label: copy.fields.personType },
        { key: 'status', label: copy.fields.status },
        { key: 'open', label: copy.actions.operations },
      ]"
      :rows="rows"
    >
      <template #open="{ row }">
        <AdminRowActions :href="row.href || ''" :edit-label="copy.actions.edit" />
      </template>
    </AccountTable>
  </div>
</template>
