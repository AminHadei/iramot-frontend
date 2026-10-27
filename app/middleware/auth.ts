export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return;
  const config = useRuntimeConfig();
  if (!config.public.apiBase) return navigateTo("/");
  const auth = useAuth();
  await auth.restore();
  if (!auth.user.value) {
    return navigateTo({ path: "/auth/login", query: { next: to.fullPath } });
  }
});
