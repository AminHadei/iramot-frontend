<script setup lang="ts">
defineProps<{
  cells: Array<{
    label: string;
    title: string;
    date?: string;
    to?: string;
  }>;
}>();
</script>

<template>
  <section class="page-inset py-10">
    <ul class="grid border border-line wide:grid-cols-3">
      <li
        v-for="cell in cells"
        :key="cell.label"
        class="border-b border-line last:border-b-0 wide:border-b-0 wide:border-e wide:last:border-e-0"
      >
        <NuxtLink v-if="cell.to" :to="cell.to" class="block p-5">
          <p class="text-sm text-secondary">{{ cell.label }}</p>
          <p class="mt-3 font-heading text-xl leading-snug text-ink">
            {{ cell.title }}
          </p>
          <p v-if="cell.date" class="mt-2 text-sm text-secondary">
            <PersianDate :date="cell.date" />
          </p>
        </NuxtLink>
        <div v-else class="p-5">
          <p class="text-sm text-secondary">{{ cell.label }}</p>
          <p class="mt-3 font-heading text-xl leading-snug text-ink">
            {{ cell.title }}
          </p>
          <p v-if="cell.date" class="mt-2 text-sm text-secondary">
            <PersianDate :date="cell.date" />
          </p>
        </div>
      </li>
    </ul>
  </section>
</template>
