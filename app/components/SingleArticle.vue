<script setup lang="ts">
defineProps<{
  title: string;
  category?: string;
  date?: string;
  toc?: Array<{ id: string; label: string }>;
}>();
</script>

<template>
  <article class="mx-auto max-w-[1440px]">
    <header class="full-band full-band-primary text-paper">
      <div class="page-inset py-16">
        <p v-if="category" class="text-sm text-secondary-soft">{{ category }}</p>
        <h1
          class="mt-3 max-w-[880px] font-heading text-[2.5rem] font-normal leading-[1.15] wide:text-[3.75rem] wide:leading-[1.2]"
        >
          {{ title }}
        </h1>
        <p v-if="date" class="mt-4 text-sm">
          <PersianDate :date="date" />
        </p>
      </div>
    </header>
    <div
      class="page-inset py-10"
      :class="
        toc?.length ? 'frame:grid frame:grid-cols-[16rem_1fr] frame:gap-[60px]' : ''
      "
    >
      <nav v-if="toc?.length">
        <ul class="frame:sticky frame:top-[70px]">
          <li v-for="item in toc" :key="item.id" class="border-b border-line">
            <a :href="`#${item.id}`" class="block py-3 text-sm text-primary">
              {{ item.label }}
            </a>
          </li>
        </ul>
      </nav>
      <div class="rich-text font-heading text-base font-normal leading-relaxed">
        <slot />
      </div>
    </div>
  </article>
</template>
