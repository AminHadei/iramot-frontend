<script setup lang="ts">
definePageMeta({ layout: "panel", middleware: "auth" });

const copy = await useAccountPage("returnTitle", "returnDescription");
const route = useRoute();

const status = computed(() => String(route.query.status ?? route.query.success ?? ""));
const message = computed(() => {
  const value = status.value.toLowerCase();
  if (["success", "paid", "true", "ok"].includes(value))
    return copy.fields.returnSuccess;
  if (["failed", "failure", "false", "cancel", "cancelled"].includes(value)) {
    return copy.fields.returnFailed;
  }
  return copy.fields.returnUnknown;
});
</script>

<template>
  <div>
    <h1 class="font-heading text-4xl text-primary">{{ copy.seo.returnTitle }}</h1>
    <p class="mt-6 max-w-2xl" role="status">{{ message }}</p>
    <p v-if="route.query.paymentId" class="mt-3 text-sm text-secondary">
      {{ copy.fields.reference }}: {{ route.query.paymentId }}
    </p>
    <NuxtLink class="button mt-8 inline-block" to="/panel/applications">
      {{ copy.nav.applications }}
    </NuxtLink>
  </div>
</template>
