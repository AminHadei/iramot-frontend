<script setup lang="ts">
import { looksLikeHtml } from "~/utils/richText";
import { sanitizePublicHtml } from "~/utils/sanitizeHtml";
import { workgroupTone } from "~/data/workgroups/tone";
import type { WorkgroupArticle, WorkgroupPerson } from "~/data/workgroups/types";
import type { SiteContent } from "~/types/content";

const props = defineProps<{
  group: WorkgroupArticle;
  site: SiteContent;
}>();

const tone = computed(() => workgroupTone(props.group.colorIndex));

function cards(people: WorkgroupPerson[]) {
  return people.map((person) => ({
    name: person.name,
    role: person.role,
    image: person.photo,
    links: [] as { href: string; label: string; type: string }[],
  }));
}

const lists = computed(() => {
  if (props.group.memberLists.length) return props.group.memberLists;
  if (!props.group.members.length) return [];
  return [{ heading: props.site.ui.workgroupMembers, members: props.group.members }];
});

const hasAbout = computed(() => props.group.body.length > 0);
const hasManager = computed(() => Boolean(props.group.manager));
const hasFacts = computed(() => props.group.facts.length >= 2);
const hasLists = computed(() => lists.value.length > 0);
const hasLinks = computed(() => props.group.links.length > 0);
const hasMain = computed(() => hasAbout.value || hasLists.value);
const hasAside = computed(() => hasManager.value || hasFacts.value);
const showEmpty = computed(
  () =>
    !hasAbout.value &&
    !hasManager.value &&
    !hasLists.value &&
    !hasFacts.value &&
    !hasLinks.value,
);

const managerCards = computed(() => {
  const manager = props.group.manager;
  if (!manager) return [];
  return [
    {
      name: manager.name,
      role: props.site.ui.workgroupManager,
      image: manager.photo,
      links: [] as { href: string; label: string; type: string }[],
    },
  ];
});
</script>

<template>
  <article class="single-article news-article wg-article" :style="tone">
    <nav class="news-breadcrumb" :aria-label="site.ui.navigation">
      <NuxtLink to="/workgroups">{{ group.sectionTitle }}</NuxtLink>
      <span aria-hidden="true"> / </span>
      <span>{{ group.title }}</span>
    </nav>
    <header class="single-article__header">
      <div class="single-article__header-title">
        <h1 class="single-article__header-title-primary">{{ group.title }}</h1>
      </div>
    </header>
    <div class="single-article__content">
      <div class="wg-detail">
        <div
          v-if="hasMain || hasAside"
          class="wg-top"
          :class="{ 'wg-top--solo': !hasMain || !hasAside }"
        >
          <div v-if="hasMain" class="wg-main">
            <section v-if="hasAbout">
              <h2 class="people-group__title">{{ site.ui.workgroupAbout }}</h2>
              <div class="wg-prose">
                <template v-for="(paragraph, index) in group.body" :key="index">
                  <!-- eslint-disable vue/no-v-html -->
                  <div
                    v-if="looksLikeHtml(paragraph)"
                    v-html="sanitizePublicHtml(paragraph)"
                  />
                  <!-- eslint-enable vue/no-v-html -->
                  <p v-else>{{ paragraph }}</p>
                </template>
              </div>
            </section>
            <div
              v-for="list in lists"
              :key="list.heading"
              class="people-group-list wg-people"
            >
              <IfpPeopleGroup
                expanded
                :title="list.heading"
                :people="cards(list.members)"
              />
            </div>
          </div>
          <div v-if="hasAside" class="wg-aside">
            <div
              v-if="hasManager"
              class="people-group-list wg-people wg-people--single"
            >
              <IfpPeopleGroup
                expanded
                :title="site.ui.workgroupManager"
                :people="managerCards"
              />
            </div>
            <section v-if="hasFacts" class="wg-info opportunities-posts">
              <h2 class="opportunities-posts__title">{{ site.ui.workgroupInfo }}</h2>
              <div class="opportunities-posts__list">
                <div
                  v-for="fact in group.facts"
                  :key="fact.label"
                  class="opportunities-posts__list-item"
                >
                  <div class="opportunities-posts__list-item-title">
                    {{ fact.label }}
                  </div>
                  <div class="opportunities-posts__list-item-cta">{{ fact.value }}</div>
                </div>
              </div>
            </section>
          </div>
        </div>

        <section v-if="hasLinks">
          <h2 class="people-group__title">{{ site.ui.workgroupLinks }}</h2>
          <div class="wg-links">
            <NuxtLink
              v-for="link in group.links"
              :key="link.href"
              class="wg-link"
              :to="link.href"
            >
              <span class="wg-link__t">{{ link.label }}</span>
              <span class="wg-link__arrow" aria-hidden="true">
                <svg width="9" height="16" viewBox="0 0 9 16" fill="none">
                  <path
                    fill="currentColor"
                    d="M7.29 15.07 0.93 8.71a1 1 0 0 1 0-1.42L7.29 0.93A1 1 0 0 1 8.7 2.34L3.05 8l5.66 5.66a1 1 0 0 1-1.42 1.41Z"
                  />
                </svg>
              </span>
            </NuxtLink>
          </div>
        </section>

        <div v-if="showEmpty" class="wg-empty">
          <p>{{ site.ui.workgroupEmpty }}</p>
        </div>

        <section v-if="group.others.length">
          <h2 class="people-group__title">{{ site.ui.workgroupOthers }}</h2>
          <div class="wg-mini-grid">
            <NuxtLink
              v-for="other in group.others"
              :key="other.slug"
              class="wg-mini"
              :to="`/workgroups/${other.slug}`"
              :style="workgroupTone(other.colorIndex)"
            >
              <span class="wg-mini__t">{{ other.title }}</span>
            </NuxtLink>
          </div>
        </section>

        <nav
          v-if="group.previous || group.next"
          class="wg-pager"
          :aria-label="site.ui.navigation"
        >
          <NuxtLink
            v-if="group.previous"
            class="wg-pager__item"
            :to="`/workgroups/${group.previous.slug}`"
          >
            <span class="wg-pager__arrow" aria-hidden="true">
              <svg width="9" height="16" viewBox="0 0 9 16" fill="none">
                <path
                  fill="currentColor"
                  d="M7.29 15.07 0.93 8.71a1 1 0 0 1 0-1.42L7.29 0.93A1 1 0 0 1 8.7 2.34L3.05 8l5.66 5.66a1 1 0 0 1-1.42 1.41Z"
                />
              </svg>
            </span>
            <span class="wg-pager__text">
              <span class="wg-pager__cap">{{ site.ui.workgroupPrevious }}</span>
              <span class="wg-pager__name">{{ group.previous.title }}</span>
            </span>
          </NuxtLink>
          <span v-else />
          <NuxtLink
            v-if="group.next"
            class="wg-pager__item wg-pager__item--next"
            :to="`/workgroups/${group.next.slug}`"
          >
            <span class="wg-pager__text">
              <span class="wg-pager__cap">{{ site.ui.workgroupNext }}</span>
              <span class="wg-pager__name">{{ group.next.title }}</span>
            </span>
            <span class="wg-pager__arrow" aria-hidden="true">
              <svg width="9" height="16" viewBox="0 0 9 16" fill="none">
                <path
                  fill="currentColor"
                  d="M7.29 15.07 0.93 8.71a1 1 0 0 1 0-1.42L7.29 0.93A1 1 0 0 1 8.7 2.34L3.05 8l5.66 5.66a1 1 0 0 1-1.42 1.41Z"
                />
              </svg>
            </span>
          </NuxtLink>
        </nav>
      </div>
    </div>
  </article>
</template>
