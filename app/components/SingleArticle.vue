<script setup lang="ts">
defineProps<{
  title: string;
  category?: string;
  date?: string;
  image?: string;
  subtitle?: string;
  toc?: Array<{ id: string; label: string }>;
}>();

const tocOpen = ref(false);
</script>

<template>
  <article class="single-article" :style="categoryColor(0)">
    <header class="single-article__header">
      <div v-if="category || date" class="single-article__header-category">
        <div v-if="category" class="single-article__header-category-container">
          <div class="single-article__header-category-name">{{ category }}</div>
        </div>
        <div
          v-if="date"
          class="single-article__header-date single-article__header-date--desktop"
        >
          <PersianDate :date="date" />
        </div>
      </div>
      <div class="single-article__header-title">
        <h1 class="single-article__header-title-primary">{{ title }}</h1>
        <div v-if="subtitle" class="single-article__header-title-subtitle">
          {{ subtitle }}
        </div>
      </div>
      <div
        v-if="date"
        class="single-article__header-date single-article__header-date--mobile"
      >
        <PersianDate :date="date" />
      </div>
    </header>
    <div class="single-article__content">
      <div class="article">
        <ul
          v-if="toc?.length"
          class="article__toc toc toc--has-list-items"
          :class="{ 'toc--nav-open': tocOpen }"
        >
          <li
            class="toc__button"
            role="button"
            tabindex="0"
            @click="tocOpen = !tocOpen"
            @keydown.enter.prevent="tocOpen = !tocOpen"
          >
            <div class="toc__button-text">{{ title }}</div>
          </li>
          <li class="toc__list">
            <div class="toc__list-container">
              <ul>
                <li v-for="item in toc" :key="item.id" class="toc__item">
                  <a class="toc__link" :href="`#${item.id}`">{{ item.label }}</a>
                </li>
              </ul>
            </div>
          </li>
        </ul>
        <div class="article__content">
          <NuxtImg v-if="image" :src="image" :alt="title" provider="none" />
          <slot />
        </div>
      </div>
    </div>
  </article>
</template>
