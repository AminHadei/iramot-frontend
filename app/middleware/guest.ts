import { isAdminRole } from "~/utils/authUser";
import { safeNextPath } from "~/utils/validators";

export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return;
  const config = useRuntimeConfig();
  if (!config.public.apiBase) return;
  const auth = useAuth();
  await auth.restore();
  if (!auth.user.value) return;
  const next = safeNextPath(to.query.next, "");
  if (next) return navigateTo(next);
  if (isAdminRole(auth.user.value.role) && to.path.startsWith("/auth")) {
    return navigateTo("/admin");
  }
  return navigateTo("/panel");
});
