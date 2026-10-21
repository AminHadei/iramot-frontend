<script setup lang="ts">
defineProps<{
  title: string;
  to: string;
  excerpt?: string;
  category?: string;
  date?: string;
  image?: string;
}>();
</script>

<template>
  <article class="grid h-full border border-line bg-paper">
    <NuxtImg
      v-if="image"
      :src="image"
      :alt="title"
      provider="none"
      class="aspect-[3/2] w-full object-cover"
    />
    <div class="border-t border-line p-5">
      <p
        v-if="category"
        class="inline-block bg-primary px-2 py-1 font-sans text-[0.875rem] font-bold leading-[1.3] text-paper"
      >
        {{ category }}
      </p>
      <h3
        class="mt-3 font-heading text-[1.25rem] font-normal leading-snug text-ink wide:text-[1.375rem]"
      >
        <NuxtLink :to="to">{{ title }}</NuxtLink>
      </h3>
      <p
        v-if="excerpt"
        class="mt-2 text-[0.8125rem] font-light leading-relaxed wide:text-[0.9375rem]"
      >
        {{ excerpt }}
      </p>
      <p v-if="date" class="mt-3 text-sm text-secondary">
        <PersianDate :date="date" />
      </p>
    </div>
  </article>
</template>
