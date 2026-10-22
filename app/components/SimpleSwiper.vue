<script setup lang="ts">
import type { Swiper as SwiperInstance } from "swiper";

defineProps<{
  previousLabel: string;
  nextLabel: string;
}>();

const root = ref<HTMLElement | null>(null);
const atStart = ref(true);
const atEnd = ref(false);
const locked = ref(false);

const narrowQuery = "(max-width: 44.99em)";

let swiper: SwiperInstance | undefined;
let media: MediaQueryList | undefined;
let job = 0;

function updateEdges() {
  if (!swiper || swiper.destroyed) {
    atStart.value = true;
    atEnd.value = true;
    locked.value = true;
    return;
  }
  locked.value = swiper.isLocked;
  atStart.value = swiper.isBeginning || swiper.isLocked;
  atEnd.value = swiper.isEnd || swiper.isLocked;
}

function destroySwiper() {
  if (swiper && !swiper.destroyed) swiper.destroy(true, true);
  swiper = undefined;
}

async function sync() {
  const id = ++job;
  const element = root.value;
  if (!element) return;
  if (window.matchMedia(narrowQuery).matches) {
    destroySwiper();
    updateEdges();
    return;
  }
  if (!swiper || swiper.destroyed) {
    const [{ default: Swiper }, { Mousewheel }] = await Promise.all([
      import("swiper"),
      import("swiper/modules"),
    ]);
    if (id !== job || root.value !== element) return;
    if (window.matchMedia(narrowQuery).matches) return;
    swiper = new Swiper(element, {
      modules: [Mousewheel],
      wrapperClass: "simple-swiper__items",
      slideClass: "simple-swiper__item",
      slidesPerView: "auto",
      slidesPerGroup: 1,
      grabCursor: true,
      simulateTouch: false,
      mousewheel: { forceToAxis: true },
      on: {
        init: updateEdges,
        slideChange: updateEdges,
        reachBeginning: updateEdges,
        reachEnd: updateEdges,
        fromEdge: updateEdges,
        lock: updateEdges,
        unlock: updateEdges,
        resize: updateEdges,
      },
    });
  }
  if (id !== job) return;
  updateEdges();
}

function onMediaChange() {
  void sync();
}

onMounted(() => {
  media = window.matchMedia(narrowQuery);
  media.addEventListener("change", onMediaChange);
  void sync();
});

onBeforeUnmount(() => {
  job += 1;
  media?.removeEventListener("change", onMediaChange);
  destroySwiper();
});

function previous() {
  swiper?.slidePrev();
}

function next() {
  swiper?.slideNext();
}
</script>

<template>
  <div
    class="home-latest__swiper-controller simple-swiper-controller"
    :class="{ 'simple-swiper-controller--disabled': locked }"
  >
    <button
      type="button"
      class="simple-swiper-controller__button simple-swiper-controller__button-left"
      :class="{ 'simple-swiper-controller__button--disabled': atStart }"
      :disabled="atStart"
      @click="previous"
    >
      <span class="sr-only">{{ previousLabel }}</span>
      <svg
        class="rtl:-scale-x-100"
        width="9"
        height="16"
        viewBox="0 0 9 16"
        fill="none"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          d="M7.3 15.1.9 8.7a1 1 0 0 1 0-1.4L7.3.9A1 1 0 0 1 8.7 2.3L3.1 8l5.6 5.7a1 1 0 0 1-1.4 1.4Z"
        />
      </svg>
    </button>
    <button
      type="button"
      class="simple-swiper-controller__button simple-swiper-controller__button-right"
      :class="{ 'simple-swiper-controller__button--disabled': atEnd }"
      :disabled="atEnd"
      @click="next"
    >
      <span class="sr-only">{{ nextLabel }}</span>
      <svg
        class="rtl:-scale-x-100"
        width="9"
        height="16"
        viewBox="0 0 9 16"
        fill="none"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          d="M1.7.9 8.1 7.3a1 1 0 0 1 0 1.4L1.7 15.1A1 1 0 0 1 .3 13.7L6 8 .3 2.3A1 1 0 0 1 1.7.9Z"
        />
      </svg>
    </button>
  </div>
  <div class="home-latest__list">
    <div ref="root" dir="rtl" class="simple-swiper simple-swiper-initialized">
      <div class="simple-swiper__items">
        <slot />
      </div>
    </div>
  </div>
</template>
