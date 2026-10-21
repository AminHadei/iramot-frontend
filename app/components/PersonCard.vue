<script setup lang="ts">
defineProps<{
  emptyLabel: string;
  name?: string;
  role?: string;
  image?: string;
}>();
</script>

<template>
  <article v-if="name" class="border border-line">
    <div class="grid grid-cols-[50fr_32fr_18fr]">
      <div class="relative border border-line bg-secondary-soft">
        <div class="pt-[100%]" />
        <NuxtImg
          v-if="image"
          :src="image"
          :alt="name"
          provider="none"
          class="absolute inset-0 size-full object-cover"
        />
      </div>
    </div>
    <h3 class="px-4 pt-4 font-heading text-xl font-normal">{{ name }}</h3>
    <p v-if="role" class="px-4 pb-4 pt-1 text-sm font-light">{{ role }}</p>
  </article>
  <p v-else class="border border-line p-5 text-sm">{{ emptyLabel }}</p>
</template>
