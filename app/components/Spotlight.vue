<script setup lang="ts">
import type { ListingCard } from "~/utils/archive";
import type { SpotlightGroup } from "~/utils/spotlight";

defineProps<{
  title: string;
  intro: string;
  postsTitle: string;
  groups: SpotlightGroup[];
  posts: Array<ListingCard & { colorIndex?: number }>;
}>();
</script>

<template>
  <div class="home-slider-container home-slider-container--spotlight">
    <div class="home-contain home-contain--spotlight">
      <div class="home-spotlight home-spotlight-intro deferred">
        <div class="home-spotlight-intro__title">
          <h2 class="home-spotlight-intro__title-text">{{ title }}</h2>
        </div>
        <div class="home-spotlight-intro__body">
          <p>{{ intro }}</p>
        </div>
        <div class="home-spotlight-intro__categories">
          <NuxtLink
            v-for="(group, index) in groups"
            :key="group.to"
            :to="group.to"
            class="spotlight-category"
            :style="categoryColor(index)"
          >
            <div class="spotlight-category__icon" aria-hidden="true">
              <SpotlightIcon :name="group.title" />
            </div>
            <div class="spotlight-category__title">{{ group.title }}</div>
            <div v-if="group.body" class="spotlight-category__body">
              {{ group.body }}
            </div>
          </NuxtLink>
        </div>
      </div>
      <div class="home-spotlight home-spotlight-posts deferred">
        <h2 class="home-spotlight-posts__title">{{ postsTitle }}</h2>
        <div class="home-spotlight-posts__list">
          <div class="simple-swiper simple-swiper-initialized">
            <div class="simple-swiper__items">
              <PostListing
                v-for="(post, index) in posts"
                :key="post.id"
                swiper
                :title="post.title"
                :to="post.to"
                :external="post.external"
                :excerpt="post.excerpt"
                :category="post.category"
                :date="post.date"
                :image="post.image"
                :color-index="post.colorIndex ?? index"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@media (max-width: 61.24em) {
  .home-spotlight-posts__list .simple-swiper-initialized {
    overflow-x: auto;
  }
}
</style>
