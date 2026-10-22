<script setup lang="ts">
defineProps<{
  previousLabel: string;
  nextLabel: string;
}>();

const scroller = ref<HTMLElement | null>(null);

function move(direction: "next" | "previous") {
  const element = scroller.value;
  if (!element) return;

  const amount = element.clientWidth * 0.8;
  const towardEnd = direction === "next" ? -amount : amount;
  const delta = document.documentElement.dir === "rtl" ? towardEnd : -towardEnd;
  element.scrollBy({ left: delta, behavior: "smooth" });
}
</script>

<template>
  <div class="home-latest__swiper-controller simple-swiper-controller">
    <button
      type="button"
      class="simple-swiper-controller__button simple-swiper-controller__button-left"
      @click="move('previous')"
    >
      <span class="sr-only">{{ previousLabel }}</span>
      <svg width="9" height="16" viewBox="0 0 9 16" fill="none" aria-hidden="true">
        <path
          fill="currentColor"
          d="M7.3 15.1.9 8.7a1 1 0 0 1 0-1.4L7.3.9A1 1 0 0 1 8.7 2.3L3.1 8l5.6 5.7a1 1 0 0 1-1.4 1.4Z"
        />
      </svg>
    </button>
    <button
      type="button"
      class="simple-swiper-controller__button simple-swiper-controller__button-right"
      @click="move('next')"
    >
      <span class="sr-only">{{ nextLabel }}</span>
      <svg width="9" height="16" viewBox="0 0 9 16" fill="none" aria-hidden="true">
        <path
          fill="currentColor"
          d="M1.7.9 8.1 7.3a1 1 0 0 1 0 1.4L1.7 15.1A1 1 0 0 1 .3 13.7L6 8 .3 2.3A1 1 0 0 1 1.7.9Z"
        />
      </svg>
    </button>
  </div>
  <div class="home-latest__list">
    <div ref="scroller" class="simple-swiper simple-swiper-initialized">
      <div class="simple-swiper__items">
        <slot />
      </div>
    </div>
  </div>
</template>

<style>
.simple-swiper-initialized {
  overflow-x: auto;
  scroll-behavior: smooth;
}

@media (max-width: 44.99em) {
  .home-latest__list .simple-swiper-initialized {
    overflow: visible;
  }
}

@media (prefers-reduced-motion: reduce) {
  .simple-swiper-initialized {
    scroll-behavior: auto;
  }
}
</style>
