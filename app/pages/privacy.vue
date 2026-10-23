<script setup lang="ts">
import type { SiteContent } from "~/types/content";
import { privacySections } from "~/utils/privacySections";

const { data: siteData } = await useSite();
if (!siteData.value) {
  throw createError({ statusCode: 500, statusMessage: "محتوای سایت پیدا نشد" });
}
const site = siteData.value as SiteContent;
const baseURL = useRuntimeConfig().app.baseURL;

const { data: privacy } = await useAsyncData("privacy-page", async () => {
  const record = archiveItems(await queryCollection("archivePages").first()).find(
    (item) => item.id === site.pages.privacy,
  );
  if (!record) return null;
  const title = record.title;
  const description = plainText(record.excerpt || record.title);
  const sections = privacySections(record.content ?? "");
  if (sections) {
    return { kind: "sections" as const, title, description, document: sections };
  }
  return {
    kind: "html" as const,
    title,
    description,
    html: articleHtml(record.content ?? "", baseURL).html,
  };
});

if (!privacy.value) {
  throw createError({ statusCode: 404, statusMessage: site.ui.notFound });
}

const page = privacy.value;
const landing = page.kind === "sections" ? page.document : null;
const numbered = landing?.sections.filter((section) => section.number !== null) ?? [];

usePageSeo({
  title: page.title,
  description: page.description,
});

const tocOpen = ref(false);
const activeId = ref("");
let spy: IntersectionObserver | undefined;

function pad(value: number) {
  return persianDigits(String(value).padStart(2, "0"));
}

function choose(id: string) {
  activeId.value = id;
  tocOpen.value = false;
}

function syncActive() {
  const line = 130;
  let current = "";
  for (const section of numbered) {
    const node = document.getElementById(section.id);
    if (!node) continue;
    if (node.getBoundingClientRect().top <= line) current = section.id;
  }
  const atBottom =
    window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
  const last = numbered.at(-1);
  if (atBottom && last) current = last.id;
  activeId.value = current;
}

onMounted(() => {
  if (!landing) return;
  spy = new IntersectionObserver(syncActive, {
    rootMargin: "-110px 0px -55% 0px",
    threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
  });
  for (const section of numbered) {
    const node = document.getElementById(section.id);
    if (node) spy.observe(node);
  }
  window.addEventListener("scroll", syncActive, { passive: true });
  syncActive();
});

onBeforeUnmount(() => {
  spy?.disconnect();
  window.removeEventListener("scroll", syncActive);
});
</script>

<template>
  <div v-if="landing" id="privacy-top">
    <div class="hero-intro hero-intro--compact">
      <h1 class="hero-intro__title">{{ page.title }}</h1>
      <div class="hero-intro__body">
        <p v-for="(paragraph, index) in landing.sections[0]?.paragraphs" :key="index">
          {{ paragraph }}
        </p>
        <p class="privacy-updated">
          {{ site.ui.privacyUpdated }}:
          <time :datetime="landing.updated.datetime">{{ landing.updated.raw }}</time>
        </p>
      </div>
    </div>

    <div class="opportunities toc-layout privacy-layout">
      <nav
        class="toc-layout__nav privacy-toc"
        :class="{ 'is-open': tocOpen }"
        :aria-label="site.ui.privacyContents"
      >
        <button
          class="privacy-toc__toggle"
          type="button"
          :aria-expanded="tocOpen"
          aria-controls="privacy-toc-list"
          @click="tocOpen = !tocOpen"
        >
          {{ site.ui.privacyContents }}
          <svg viewBox="0 0 12 8" width="12" height="8" aria-hidden="true">
            <path
              d="M1 1.5 6 6.5 11 1.5"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <div id="privacy-toc-list" class="privacy-toc__list">
          <p class="privacy-toc__label">{{ site.ui.privacyContents }}</p>
          <a
            v-for="section in numbered"
            :key="section.id"
            :href="`#${section.id}`"
            class="toc-layout__nav-item"
            :class="{ 'is-active': activeId === section.id }"
            @click="choose(section.id)"
          >
            <span class="privacy-toc__num">{{
              persianDigits(section.number ?? 0)
            }}</span>
            <span>{{ section.heading }}</span>
          </a>
        </div>
      </nav>

      <div class="opportunities__content toc-layout__content privacy-content">
        <section
          v-for="section in numbered"
          :id="section.id"
          :key="section.id"
          class="privacy-section"
          :aria-labelledby="`${section.id}-h`"
        >
          <div class="privacy-section__index" aria-hidden="true">
            {{ pad(section.number ?? 0) }}
          </div>
          <div class="privacy-section__body">
            <h2 :id="`${section.id}-h`" class="privacy-section__title">
              {{ section.heading }}
            </h2>
            <p v-for="(paragraph, index) in section.paragraphs" :key="index">
              {{ paragraph }}
            </p>
            <ol v-if="section.list?.type === 'ol'" class="privacy-list">
              <li v-for="(item, index) in section.list.items" :key="index">
                {{ item }}
              </li>
            </ol>
            <div
              v-else-if="section.list?.type === 'ul'"
              class="opportunities-posts privacy-contact"
            >
              <div class="opportunities-posts__list">
                <a
                  v-for="item in section.list.items"
                  :key="item.raw"
                  class="opportunities-posts__list-item"
                  :href="item.href"
                >
                  <span class="opportunities-posts__list-item-title">{{
                    item.label
                  }}</span>
                  <span class="opportunities-posts__list-item-cta" dir="ltr">{{
                    item.value
                  }}</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        <div class="privacy-end">
          <p class="privacy-end__date">
            <strong>{{ landing.updated.label }}</strong
            >:
            <time :datetime="landing.updated.datetime">{{ landing.updated.raw }}</time>
          </p>
          <p class="privacy-return">
            <a class="privacy-return__link" href="#privacy-top">{{
              site.ui.privacyTop
            }}</a>
          </p>
        </div>
      </div>
    </div>
  </div>

  <div v-else-if="page.kind === 'html'" class="page-standard">
    <h1 class="page-standard__title">{{ page.title }}</h1>
    <div class="page-standard__content">
      <ArchiveHtml :html="page.html" />
    </div>
  </div>
</template>
