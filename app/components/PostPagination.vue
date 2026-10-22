<script setup lang="ts">
defineProps<{
  previous?: string;
  next?: string;
  previousLabel: string;
  nextLabel: string;
}>();
</script>

<template>
  <nav v-if="previous || next" class="post-pagination">
    <NuxtLink
      v-if="previous"
      class="post-pagination__prev"
      :to="previous"
      :aria-label="previousLabel"
    >
      <svg
        class="rtl:-scale-x-100"
        width="9"
        height="16"
        viewBox="0 0 9 16"
        fill="none"
        aria-hidden="true"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M7.29289 15.071L0.928933 8.70704C0.538409 8.31651 0.538409 7.68335 0.928933 7.29282L7.29289 0.928862C7.68342 0.538338 8.31658 0.538338 8.70711 0.928863C9.09763 1.31939 9.09763 1.95255 8.70711 2.34308L3.05025 7.99993L8.70711 13.6568C9.09763 14.0473 9.09763 14.6805 8.70711 15.071C8.31658 15.4615 7.68342 15.4615 7.29289 15.071Z"
        />
      </svg>
    </NuxtLink>
    <span v-else class="post-pagination__prev post-pagination__prev--disabled">
      <svg
        class="rtl:-scale-x-100"
        width="9"
        height="16"
        viewBox="0 0 9 16"
        fill="none"
        aria-hidden="true"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M7.29289 15.071L0.928933 8.70704C0.538409 8.31651 0.538409 7.68335 0.928933 7.29282L7.29289 0.928862C7.68342 0.538338 8.31658 0.538338 8.70711 0.928863C9.09763 1.31939 9.09763 1.95255 8.70711 2.34308L3.05025 7.99993L8.70711 13.6568C9.09763 14.0473 9.09763 14.6805 8.70711 15.071C8.31658 15.4615 7.68342 15.4615 7.29289 15.071Z"
        />
      </svg>
    </span>
    <NuxtLink
      v-if="next"
      class="post-pagination__next"
      :to="next"
      :aria-label="nextLabel"
    >
      <svg
        class="rtl:-scale-x-100"
        width="9"
        height="16"
        viewBox="0 0 9 16"
        fill="none"
        aria-hidden="true"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M2.34309 0.92888L8.70705 7.29284C9.09758 7.68337 9.09758 8.31653 8.70705 8.70705L2.34309 15.071C1.95257 15.4615 1.3194 15.4615 0.928878 15.071C0.538354 14.6805 0.538354 14.0473 0.928878 13.6568L6.58573 7.99995L0.928879 2.34309C0.538355 1.95257 0.538355 1.3194 0.92888 0.92888C1.3194 0.538355 1.95257 0.538355 2.34309 0.92888Z"
        />
      </svg>
    </NuxtLink>
    <span v-else class="post-pagination__next post-pagination__next--disabled">
      <svg
        class="rtl:-scale-x-100"
        width="9"
        height="16"
        viewBox="0 0 9 16"
        fill="none"
        aria-hidden="true"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M2.34309 0.92888L8.70705 7.29284C9.09758 7.68337 9.09758 8.31653 8.70705 8.70705L2.34309 15.071C1.95257 15.4615 1.3194 15.4615 0.928878 15.071C0.538354 14.6805 0.538354 14.0473 0.928878 13.6568L6.58573 7.99995L0.928879 2.34309C0.538355 1.95257 0.538355 1.3194 0.92888 0.92888C1.3194 0.538355 1.95257 0.538355 2.34309 0.92888Z"
        />
      </svg>
    </span>
  </nav>
</template>
