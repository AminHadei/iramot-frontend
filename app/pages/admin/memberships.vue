<script setup lang="ts">
import type { MembershipApplication, MembershipPlan } from "~/types/membership";
import { asPage } from "~/utils/pageResult";
import { recordId } from "~/utils/money";
import { loadPlans, planTitle } from "~/utils/membershipRead";

definePageMeta({ layout: "panel", middleware: "admin" });

const copy = await useAccountPage("membershipsTitle", "membershipsDescription");
const auth = useAuth();
const route = useRoute();
const router = useRouter();
const status = ref(String(route.query.status ?? "approved"));
const rows = ref<Array<Record<string, string>>>([]);
const error = ref("");

async function load() {
  try {
    const [body, plans] = await Promise.all([
      auth.api().request<unknown>("/admin/membership/applications", {
        query: { status: status.value },
      }),
      loadPlans(auth.api()).catch(() => [] as MembershipPlan[]),
    ]);
    const items = Array.isArray(body)
      ? (body as MembershipApplication[])
      : asPage<MembershipApplication>(body).items;
    rows.value = items.map((item) => ({
      id: recordId(item),
      title: planTitle(plans, item.planId, item.planTitle),
      user: String(item.userId ?? ""),
      status:
        copy.status[item.membershipState ?? ""] ??
        copy.status[item.status] ??
        item.status,
      expires: String(item.expiresAt ?? ""),
    }));
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
    <h1 class="font-heading text-4xl text-primary">{{ copy.seo.membershipsTitle }}</h1>
    <form class="mt-6 grid max-w-sm gap-4" @submit.prevent="filter">
      <AccountSelect
        v-model="status"
        :label="copy.fields.status"
        :options="[
          { value: 'approved', label: copy.status.approved },
          { value: 'expired', label: copy.status.expired },
          { value: '', label: copy.fields.allStatuses },
        ]"
      />
      <button class="button" type="submit">{{ copy.actions.filter }}</button>
    </form>
    <p v-if="error" class="mt-4 text-accent" role="alert">{{ error }}</p>
    <AccountTable
      class="mt-6"
      :empty="copy.fields.empty"
      :columns="[
        { key: 'user', label: copy.fields.user },
        { key: 'title', label: copy.fields.plan },
        { key: 'status', label: copy.fields.status },
        { key: 'expires', label: copy.fields.expires },
      ]"
      :rows="rows"
    />
  </div>
</template>
