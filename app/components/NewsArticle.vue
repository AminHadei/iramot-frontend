<script setup lang="ts">
import type { NewsArticleView } from "~/composables/useNews";
import type { ArticleHeading } from "~/utils/articleHtml";
import type { SiteContent } from "~/types/content";
import { withBase } from "~/utils/withBase";

const props = defineProps<{
  post: NewsArticleView;
  site: SiteContent;
}>();

const config = useRuntimeConfig();
const tocOpen = ref(false);
const award = computed(() => props.post.topic === "award");
const category = computed(() => primaryNewsCategory(props.post.categories));
const tone = computed(() =>
  award.value ? awardTopicColor() : newsCategoryColor(category.value?.slug ?? "news"),
);
const articleStyle = computed(() => ({
  ...tone.value,
  "--hero-blend": `url("${withBase(config.app.baseURL, "/images/hero-intro-blend-1.webp")}")`,
}));
const categoryTo = computed(() =>
  award.value ? "/award" : newsCategoryPath(category.value?.slug),
);
const label = computed(() =>
  award.value ? props.site.ui.awardTopic : category.value?.name,
);
const author = computed(() => props.post.author?.name || "");
const groups = computed(() => {
  const grouped: Array<{ id: string; label: string; children: ArticleHeading[] }> = [];
  for (const item of props.post.toc) {
    if (item.level === 3 && grouped.length) {
      grouped[grouped.length - 1]?.children.push(item);
      continue;
    }
    grouped.push({ id: item.id, label: item.label, children: [] });
  }
  return grouped;
});
</script>

<template>
  <div>
    <article
      class="single-article news-article"
      :class="{ 'single-article--no-toc': !groups.length }"
      :style="articleStyle"
    >
      <nav class="news-breadcrumb" :aria-label="site.ui.navigation">
        <NuxtLink to="/news">{{ site.listings.research.title }}</NuxtLink>
        <template v-if="award">
          <span aria-hidden="true"> / </span>
          <NuxtLink to="/award">{{ site.ui.awardTopic }}</NuxtLink>
        </template>
        <template v-else-if="category && category.slug !== 'news'">
          <span aria-hidden="true"> / </span>
          <NuxtLink :to="categoryTo">{{ category.name }}</NuxtLink>
        </template>
        <span aria-hidden="true"> / </span>
        <span>{{ post.title }}</span>
      </nav>
      <header class="single-article__header">
        <div v-if="label || post.date" class="single-article__header-category">
          <NuxtLink
            v-if="label"
            class="single-article__header-category-container"
            :to="categoryTo"
          >
            <div class="single-article__header-category-name">{{ label }}</div>
          </NuxtLink>
          <div
            v-if="post.date"
            class="single-article__header-date single-article__header-date--desktop"
          >
            <PersianDate :date="post.date" />
          </div>
        </div>
        <div class="single-article__header-title">
          <h1 class="single-article__header-title-primary">{{ post.title }}</h1>
        </div>
        <div
          v-if="post.date"
          class="single-article__header-date single-article__header-date--mobile"
        >
          <PersianDate :date="post.date" />
        </div>
        <div v-if="author" class="single-article__header-authors">
          <div class="author-list">
            <span>{{ site.ui.newsAuthor + "\u00a0" }}</span>
            <span class="author-list__author">
              <span>{{ author }}</span>
            </span>
          </div>
        </div>
      </header>
      <main class="single-article__content">
        <div class="article">
          <ul
            v-if="groups.length"
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
              <div class="toc__button-text">{{ site.ui.newsContents }}</div>
            </li>
            <li class="toc__list">
              <div class="toc__list-container">
                <ul>
                  <li v-for="group in groups" :key="group.id" class="toc__item">
                    <a class="toc__link" :href="`#${group.id}`">{{ group.label }}</a>
                    <ul v-if="group.children.length" class="toc__item-sub-items">
                      <li
                        v-for="child in group.children"
                        :key="child.id"
                        class="toc__item-sub-items-item"
                      >
                        <a class="toc__link" :href="`#${child.id}`">{{
                          child.label
                        }}</a>
                      </li>
                    </ul>
                  </li>
                </ul>
              </div>
            </li>
          </ul>
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div class="article__content" v-html="post.contentHtml" />
        </div>
      </main>
    </article>
    <div v-if="post.related.length" class="post-listing-list news-related">
      <h2 class="news-related__title">{{ site.ui.newsRelated }}</h2>
      <div class="post-listing-list__list">
        <NewsCard
          v-for="item in post.related"
          :key="item.id"
          :item="item"
          :link-label="site.ui.newsRead"
          :by-label="site.ui.newsAuthor"
          :topic-badge="site.ui.awardTopic"
        />
      </div>
    </div>
  </div>
</template>
