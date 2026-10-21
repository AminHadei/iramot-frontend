<script setup lang="ts">
defineProps<{
  title: string;
  intro: string;
  areas: Array<{ title: string; question: string; to: string }>;
}>();
</script>

<template>
  <section
    class="flex flex-col max-frame:flex-col frame:grid frame:grid-cols-2 frame:border-b frame:border-line"
  >
    <div
      class="full-band full-band-accent self-start px-[24px] pb-10 pt-[72px] text-paper frame:sticky frame:top-[70px] frame:px-9 lg:px-[60px]"
    >
      <h2 class="font-heading text-[2rem] leading-none">{{ title }}</h2>
      <p class="mt-4 max-w-md text-sm font-light leading-relaxed">{{ intro }}</p>
    </div>
    <ul>
      <li v-for="area in areas" :key="area.title" class="border-t border-accent">
        <NuxtLink
          :to="area.to"
          class="grid grid-cols-[72px_1fr] gap-x-[14px] gap-y-1 px-[24px] py-4 frame:px-9 lg:px-[60px]"
        >
          <span class="row-span-2 mt-1 size-8 border border-line" aria-hidden="true" />
          <span class="font-sans text-[0.875rem] font-bold leading-[1.3]">{{
            area.title
          }}</span>
          <span class="text-sm font-light leading-relaxed">{{ area.question }}</span>
        </NuxtLink>
      </li>
    </ul>
  </section>
</template>
