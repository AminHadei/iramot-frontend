<script setup lang="ts">
import type { SiteContent } from "~/types/content";

const { data: site } = await useSite();
const route = useRoute();
const copy = await usePanelCopy();
const auth = useAuth();
const authUser = auth.user;

const items = computed(() => {
  const admin = route.path.startsWith("/admin");
  const source = admin ? copy.adminNav : copy.nav;
  const links: Array<[string, string]> = admin
    ? [
        ["dashboard", "/admin"],
        ["queue", "/admin/applications"],
        ["memberships", "/admin/memberships"],
        ["payments", "/admin/payments"],
        ["plans", "/admin/plans"],
        ["discounts", "/admin/discounts"],
        ["users", "/admin/users"],
        ["content", "/admin/content"],
      ]
    : [
        ["dashboard", "/panel"],
        ["profile", "/panel/profile"],
        ["password", "/panel/password"],
        ["membership", "/panel/membership"],
        ["applications", "/panel/applications"],
        ["payments", "/panel/payments"],
        ["card", "/panel/card"],
      ];
  return links.map(([key, to]) => ({ label: source[key] ?? key, to }));
});

async function signOut() {
  await auth.logout();
  await navigateTo("/");
}

function current(to: string) {
  const path = route.path.replace(/\/+$/, "") || "/";
  const target = to.replace(/\/+$/, "") || "/";
  if (target === "/admin" || target === "/panel") return path === target;
  return path === target || path.startsWith(`${target}/`);
}

useHead({
  bodyAttrs: { class: "loaded" },
});
</script>

<template>
  <div v-if="site" class="min-h-screen font-sans text-ink">
    <AppHeader :site="site as SiteContent" />
    <main id="content" class="site-main">
      <div class="page-wrap py-10">
        <div class="grid items-start gap-8 lg:grid-cols-[15rem_minmax(0,1fr)]">
          <nav class="border border-line bg-paper p-4" :aria-label="copy.nav.dashboard">
            <p v-if="authUser" class="mb-4 text-sm text-secondary">
              {{ authUser.firstName }} {{ authUser.lastName }}
            </p>
            <ul class="m-0 grid list-none gap-2 p-0">
              <li v-for="item in items" :key="item.to">
                <NuxtLink
                  :to="item.to"
                  class="block py-1 text-primary"
                  :aria-current="current(item.to) ? 'page' : undefined"
                >
                  {{ item.label }}
                </NuxtLink>
              </li>
            </ul>
            <button type="button" class="button mt-6 text-sm" @click="signOut">
              {{ copy.actions.logout }}
            </button>
          </nav>
          <div class="min-w-0">
            <slot />
          </div>
        </div>
      </div>
    </main>
    <AppFooter :site="site as SiteContent" />
  </div>
</template>
