<script setup lang="ts">
defineProps<{
  title: string;
  label: string;
  submit: string;
  note: string;
}>();
</script>

<template>
  <div class="newsletter-pre-footer">
    <div class="newsletter-pre-footer__body">
      <div class="newsletter-pre-footer__title">{{ title }}</div>
      <div class="newsletter-pre-footer__notice">{{ note }}</div>
      <div class="newsletter-pre-footer__form">
        <form @submit.prevent>
          <label>
            {{ label }}
            <input type="email" name="email" autocomplete="email" :aria-label="label" />
          </label>
          <button type="submit">{{ submit }}</button>
        </form>
      </div>
    </div>
  </div>
</template>
