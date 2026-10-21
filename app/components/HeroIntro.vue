<script setup lang="ts">
defineProps<{
  title: string;
  dek?: string;
}>();
</script>

<template>
  <section class="full-band full-band-primary mb-[30px] text-paper">
    <div class="page-inset grid content-end gap-6 pb-10 pt-[130px] wide:grid-cols-2">
      <h1
        class="font-heading text-[2.5rem] font-normal leading-[1.15] wide:text-[3.75rem] wide:leading-[1.2]"
      >
        {{ title }}
      </h1>
      <p v-if="dek" class="max-w-xl self-end text-sm font-light leading-relaxed">
        {{ dek }}
      </p>
    </div>
  </section>
</template>
