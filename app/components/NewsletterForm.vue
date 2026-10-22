<script setup lang="ts">
defineProps<{
  title: string;
  note: string;
  link: string;
  to: string;
}>();
</script>

<template>
  <div class="newsletter-pre-footer deferred">
    <div class="newsletter-pre-footer__body">
      <div class="newsletter-pre-footer__title">{{ title }}</div>
      <div class="newsletter-pre-footer__notice">{{ note }}</div>
      <div class="newsletter-pre-footer__form">
        <NuxtLink :to="to">{{ link }}</NuxtLink>
      </div>
    </div>
    <div class="newsletter-pre-footer__graphic">
      <NuxtImg
        src="/images/lines-footer-pattern.png"
        alt=""
        provider="none"
        width="955"
        height="224"
      />
    </div>
  </div>
</template>
