<script setup lang="ts">
import type { Swiper as SwiperInstance } from "swiper";
import type { ListingCard } from "~/utils/archive";
import type { SpotlightGroup } from "~/utils/spotlight";

defineProps<{
  title: string;
  intro: string;
  postsTitle: string;
  groups: SpotlightGroup[];
  posts: Array<ListingCard & { colorIndex?: number; authors?: string[] }>;
  linkLabel?: string;
  byLabel?: string;
}>();

const postsRoot = ref<HTMLElement | null>(null);
const narrowPosts = "(max-width: 61.24em)";

let swiper: SwiperInstance | undefined;
let media: MediaQueryList | undefined;
let job = 0;

function destroySwiper() {
  if (swiper && !swiper.destroyed) swiper.destroy(true, true);
  swiper = undefined;
}

async function sync() {
  const id = ++job;
  const element = postsRoot.value;
  if (!element) return;
  if (!window.matchMedia(narrowPosts).matches) {
    destroySwiper();
    return;
  }
  if (swiper && !swiper.destroyed) return;
  const [{ default: Swiper }, { Mousewheel }] = await Promise.all([
    import("swiper"),
    import("swiper/modules"),
  ]);
  if (id !== job || postsRoot.value !== element) return;
  if (!window.matchMedia(narrowPosts).matches) return;
  swiper = new Swiper(element, {
    modules: [Mousewheel],
    wrapperClass: "simple-swiper__items",
    slideClass: "simple-swiper__item",
    slidesPerView: "auto",
    slidesPerGroup: 1,
    grabCursor: true,
    simulateTouch: false,
    mousewheel: { forceToAxis: true },
  });
}

function onMediaChange() {
  void sync();
}

onMounted(() => {
  media = window.matchMedia(narrowPosts);
  media.addEventListener("change", onMediaChange);
  void sync();
});

onBeforeUnmount(() => {
  job += 1;
  media?.removeEventListener("change", onMediaChange);
  destroySwiper();
});
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
          <template v-for="(group, index) in groups" :key="group.to">
            <a
              v-if="group.to.startsWith('http')"
              :href="group.to"
              class="spotlight-category"
              :style="categoryColor((group.color ?? index + 1) - 1)"
            >
              <GroupLines :index="index" />
              <div class="spotlight-category__title">{{ group.title }}</div>
              <div v-if="group.body" class="spotlight-category__body">
                {{ group.body }}
              </div>
            </a>
            <NuxtLink
              v-else
              :to="group.to"
              class="spotlight-category"
              :style="categoryColor((group.color ?? index + 1) - 1)"
            >
              <GroupLines :index="index" />
              <div class="spotlight-category__title">{{ group.title }}</div>
              <div v-if="group.body" class="spotlight-category__body">
                {{ group.body }}
              </div>
            </NuxtLink>
          </template>
        </div>
      </div>
      <div class="home-spotlight home-spotlight-posts deferred">
        <h2 class="home-spotlight-posts__title">{{ postsTitle }}</h2>
        <div class="home-spotlight-posts__list">
          <div
            ref="postsRoot"
            dir="rtl"
            class="simple-swiper simple-swiper-initialized"
          >
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
                :link-label="linkLabel"
                :authors="post.authors"
                :by-label="byLabel"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
