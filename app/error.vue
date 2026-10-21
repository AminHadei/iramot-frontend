<script setup lang="ts">
import type { NuxtError } from "#app";

defineProps<{
  error: NuxtError;
}>();

const { data: site } = await useSite();

const title = computed(() => site.value?.ui.notFound ?? "صفحه پیدا نشد");
const description = computed(() => site.value?.ui.notFoundBody);

usePageSeo({
  title: title.value,
  description: description.value,
});
</script>

<template>
  <NuxtLayout>
    <section class="page-wrap py-24">
      <p class="text-sm text-secondary">{{ error.statusCode }}</p>
      <h1 class="mt-4 font-heading text-4xl text-primary md:text-5xl">{{ title }}</h1>
      <p v-if="description" class="mt-4 max-w-xl text-lg">{{ description }}</p>
      <button
        type="button"
        class="mt-8 inline-flex items-center gap-2 text-primary"
        @click="clearError({ redirect: '/' })"
      >
        {{ site?.ui.home }}
        <DirectionalIcon name="arrow" />
      </button>
    </section>
  </NuxtLayout>
</template>
