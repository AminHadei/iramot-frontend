<script setup lang="ts">
defineProps<{
  previousLabel: string;
  nextLabel: string;
  stack?: boolean;
}>();

const scroller = ref<HTMLElement | null>(null);

function move(direction: "next" | "previous") {
  const element = scroller.value;
  if (!element) {
    return;
  }

  const amount = element.clientWidth * 0.8;
  const towardEnd = direction === "next" ? -amount : amount;
  const delta = document.documentElement.dir === "rtl" ? towardEnd : -towardEnd;
  element.scrollBy({ left: delta, behavior: "smooth" });
}
</script>

<template>
  <div>
    <div
      ref="scroller"
      class="flex overflow-x-auto scroll-smooth"
      :class="stack ? 'frame:flex-col frame:overflow-visible' : ''"
    >
      <slot />
    </div>
    <div class="mt-4 hidden gap-[10px] wide:flex" :class="stack ? 'frame:hidden' : ''">
      <button
        type="button"
        class="inline-flex size-10 items-center justify-center border border-line"
        @click="move('previous')"
      >
        <span class="sr-only">{{ previousLabel }}</span>
        <DirectionalIcon name="arrow" class="-scale-x-100" />
      </button>
      <button
        type="button"
        class="inline-flex size-10 items-center justify-center border border-line"
        @click="move('next')"
      >
        <span class="sr-only">{{ nextLabel }}</span>
        <DirectionalIcon name="arrow" />
      </button>
    </div>
  </div>
</template>
