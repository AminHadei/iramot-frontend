import type { MembershipPlan } from "~/types/membership";
import type { ApiClient } from "~/utils/apiClient";
import { asPage } from "~/utils/pageResult";

export const pendingPaymentKey = "irmot.pendingPayment";

export async function loadPlans(
  api: ApiClient,
  activeOnly = false,
): Promise<MembershipPlan[]> {
  const body = await api.request<unknown>("/membership-plans", {
    query: activeOnly ? { isActive: true } : undefined,
  });
  const items = Array.isArray(body)
    ? (body as MembershipPlan[])
    : asPage<MembershipPlan>(body).items;
  return [...items].sort(
    (left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0),
  );
}

export function planTitle(
  plans: MembershipPlan[],
  planId: string,
  embedded?: string | null,
): string {
  return plans.find((plan) => plan.id === planId)?.title || embedded || planId;
}
