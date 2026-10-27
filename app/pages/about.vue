<script setup lang="ts">
import type { CSSProperties } from "vue";
import type { SiteContent } from "~/types/content";
import { createApiAboutRepository } from "~/data/singletons/api";
import { aboutHashAliases } from "~/utils/aboutHash";
import { withBase } from "~/utils/withBase";

interface AboutLink {
  type: string;
  href: string;
  text?: string;
}

interface CardPerson {
  name: string;
  role: string;
  image: string;
  links: { href: string; label: string; type: string }[];
  page?: { to: string; label: string };
}

interface ContactBlock {
  p?: string;
  links?: { href: string; text: string }[];
}

interface StatuteBlock {
  p?: string;
  lines?: string[];
}

interface CommitteeGroup {
  title: string;
  body?: string[];
  manager: { name: string; photo: { src: string } } | null;
  link?: { label: string; href: string };
  social?: { type: string; href: string }[];
}

interface AboutDocument {
  title: string;
  section_nav: { id: string; label: string }[];
  hero: {
    slides: { src: string; alt: string }[];
    source_settings: {
      autoplay_speed: number | string;
      speed: number | string;
      pause_on_hover: string;
    };
  };
  about: {
    title: string;
    body: string[];
    contact_box: { items: { text: string; href: string }[] };
  };
  missions: {
    title: string;
    body: string[];
    items: { title: string; text: string; icon: { src: string } }[];
  };
  history: { title: string; items: { year: string; events: string[] }[] };
  board: {
    title: string;
    people: {
      name: string;
      role: string;
      photo: { src: string };
      links?: AboutLink[];
    }[];
  };
  past_boards: {
    title: string;
    terms: { tab: string; groups: { heading: string; items: string[] }[] }[];
  };
  founders: { title: string; rows: { name: string; degree: string }[] };
  workgroups: {
    title: string;
    manager_label: string;
    groups: CommitteeGroup[];
  };
  statute: {
    chapters: {
      title: string;
      articles: { title: string; content: StatuteBlock[] }[];
    }[];
  };
  contact: {
    intro: string;
    items: { label: string; content: ContactBlock[] }[];
    form: {
      fields: {
        label: string;
        name: string;
        type: string;
        required: boolean;
        options?: string[];
      }[];
      submit: string;
      messages: {
        invalid: string;
        email: string;
        success: string;
        error: string;
      };
    };
    map: { title: string; src: string };
    social: { type: string; href: string }[];
  };
}

const linkLabels: Record<string, string> = {
  instagram: "Instagram",
  linkedin: "LinkedIn",
  website: "Website",
  wikipedia: "Wikipedia",
};

const { data: siteData } = await useSite();
if (!siteData.value) {
  throw createError({ statusCode: 500, statusMessage: "محتوای سایت پیدا نشد" });
}
const site = siteData.value as SiteContent;
const contentConfig = useRuntimeConfig();

const { data } = await useAsyncData("about-landing", () =>
  createApiAboutRepository(useContentApiBase(), contentConfig.app.baseURL).get(),
);

const record = data.value as {
  title?: string;
  meta?: unknown;
  section_nav?: unknown;
} | null;
if (!record) {
  throw createError({ statusCode: 404, statusMessage: site.ui.notFound });
}

const nested = record.section_nav
  ? (record as Partial<AboutDocument>)
  : typeof record.meta === "string"
    ? (JSON.parse(record.meta) as Partial<AboutDocument>)
    : (record.meta as Partial<AboutDocument> | undefined);
const page = { ...nested, title: record.title ?? nested?.title ?? "" } as AboutDocument;
if (!page.section_nav || !page.about || !page.contact) {
  throw createError({ statusCode: 404, statusMessage: site.ui.notFound });
}
const config = useRuntimeConfig();
const route = useRoute();
const router = useRouter();

usePageSeo({
  title: page.title,
  description: page.about.body[0],
});

function mediaPath(src: string) {
  const file = decodeURIComponent(src.split("/").pop() ?? "");
  const located = src.match(/uploads\/(\d{4})\/(\d{2})\//);
  const sized = file.match(/^(.*)-\d+x\d+(\.[a-z0-9]+)$/i);
  if (located && sized) {
    return `/media/${located[1]}/${located[2]}/${sized[1]}${sized[2]}`;
  }
  return `/media/about/${file}`;
}

function labelFor(type: string) {
  return linkLabels[type] ?? type;
}

function splitInTwo<T>(items: T[]): T[][] {
  const mid = Math.ceil(items.length / 2);
  return [items.slice(0, mid), items.slice(mid)];
}

function navLabel(id: string) {
  return page.section_nav.find((item) => item.id === id)?.label ?? "";
}

function fieldDomId(name: string) {
  return `about-${name.replace(/[^a-z0-9]+/gi, "-")}`;
}

function visibleParagraphs(title: string, lines: string[] | undefined) {
  if (placeholderTitles.has(title)) return [];
  return lines ?? [];
}

function cardLinks(links: AboutLink[] | undefined) {
  // TODO: links set to "#" and source_links_suspect (duplicate social accounts) are omitted.
  return (links ?? [])
    .filter((link) => link.href && link.href !== "#")
    .map((link) => ({ href: link.href, label: labelFor(link.type), type: link.type }));
}

const pitchSlide = page.hero.slides[0];
const boardPeople: CardPerson[] = page.board.people.map((person) => ({
  name: person.name,
  role: person.role,
  image: mediaPath(person.photo.src),
  links: cardLinks(person.links),
}));

const workgroupList = await useWorkgroupList();
const workgroupRecords = workgroupList.data.value?.groups ?? [];
const workgroupByTitle = new Map(
  workgroupRecords.map((group) => [group.titleFull, `/workgroups/${group.slug}`]),
);
const placeholderTitles = new Set(
  workgroupRecords.filter((group) => group.placeholder).map((group) => group.titleFull),
);

function workgroupPath(title: string) {
  return workgroupByTitle.get(title);
}

const managers: CardPerson[] = page.workgroups.groups.flatMap((group) => {
  if (!group.manager) return [];
  const to = workgroupPath(group.title);
  return [
    {
      name: group.manager.name,
      role: group.title,
      image: mediaPath(group.manager.photo.src),
      links: cardLinks(group.social),
      ...(to ? { page: { to, label: site.ui.workgroupPage } } : {}),
    },
  ];
});

const pastColumns = splitInTwo(page.past_boards.terms);
const founderColumns = splitInTwo(page.founders.rows);
const committeeColumns = splitInTwo(page.workgroups.groups);

const brokenPhone = "http://02188621518";

interface ContactRow {
  key: string;
  label: string;
  text: string;
  href?: string;
}

const contactRows: ContactRow[] = [];
for (const item of page.contact.items) {
  // TODO: http://02188621518 is not a telephone link and is omitted.
  for (const block of item.content) {
    if ((block.links ?? []).some((entry) => entry.href === brokenPhone)) continue;
    const link = block.links?.[0];
    const text = link?.text ?? block.p;
    if (!text) continue;
    contactRows.push({
      key: `${item.label}-${link?.href ?? text}`,
      label: item.label,
      text,
      href: link?.href,
    });
  }
}

const contactFieldOrder = [
  "form_fields[name]",
  "form_fields[email]",
  "form_fields[field_31ee070]",
  "form_fields[message]",
  "form_fields[field_54a2942]",
];
const contactFields = [...page.contact.form.fields].sort(
  (a, b) => contactFieldOrder.indexOf(a.name) - contactFieldOrder.indexOf(b.name),
);
const formValues = reactive<Record<string, string>>({});
const formErrors = reactive<Record<string, string>>({});
for (const field of contactFields) {
  formValues[field.name] = field.type === "select" ? (field.options?.[0] ?? "") : "";
}
const formStatus = ref<"" | "success" | "error">("");
const formPending = ref(false);

function socialLabel(type: string) {
  return site.social.find((item) => item.name === type)?.label ?? labelFor(type);
}

function submitContact() {
  // TODO: contact form has no endpoint yet.
  formStatus.value = "";
  for (const key of Object.keys(formErrors)) formErrors[key] = "";
  let invalid = false;
  for (const field of contactFields) {
    const value = String(formValues[field.name] ?? "").trim();
    if (field.required && !value) {
      formErrors[field.name] = page.contact.form.messages.invalid;
      invalid = true;
      continue;
    }
    if (field.type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      formErrors[field.name] = page.contact.form.messages.email;
      invalid = true;
    }
  }
  if (invalid) return;
  formStatus.value = "error";
}

const slideIndex = ref(0);
const fading = ref(false);
const activeId = ref("");
let timer: ReturnType<typeof setInterval> | undefined;
let fadeTimer: ReturnType<typeof setTimeout> | undefined;
let spy: IntersectionObserver | undefined;

const autoplayMs = Number(page.hero.source_settings.autoplay_speed) || 5000;
const fadeMs = Number(page.hero.source_settings.speed) || 500;
const pauseOnHover = page.hero.source_settings.pause_on_hover === "yes";

const heroStyle = computed(() => {
  const slide = page.hero.slides[slideIndex.value];
  if (!slide) return {} as CSSProperties;
  const url = withBase(config.app.baseURL, encodeURI(mediaPath(slide.src)));
  const blend = withBase(config.app.baseURL, "/images/hero-intro-blend-1.webp");
  return {
    "--hero-image": `url("${url}")`,
    "--hero-blend": `url("${blend}")`,
    "--hero-opacity": fading.value ? "0" : "0.25",
  } as CSSProperties;
});

function clearSlideTimers() {
  if (timer) clearInterval(timer);
  if (fadeTimer) clearTimeout(fadeTimer);
  timer = undefined;
  fadeTimer = undefined;
}

function advanceSlide() {
  fading.value = true;
  fadeTimer = setTimeout(() => {
    slideIndex.value = (slideIndex.value + 1) % page.hero.slides.length;
    fading.value = false;
  }, fadeMs);
}

function startSlides() {
  clearSlideTimers();
  if (page.hero.slides.length < 2) return;
  timer = setInterval(advanceSlide, autoplayMs);
}

function onHeroEnter() {
  if (pauseOnHover) clearSlideTimers();
}

function onHeroLeave() {
  if (pauseOnHover) startSlides();
}

watch(
  () => route.hash,
  (hash) => {
    const raw = decodeURIComponent(hash.replace(/^#/, ""));
    if (!raw) return;
    const mapped = aboutHashAliases[raw];
    if (mapped) {
      void router.replace({ path: route.path, hash: `#${mapped}` });
      return;
    }
    activeId.value = raw;
  },
  { immediate: true },
);

function syncActive() {
  const line = 130;
  let current = "";
  for (const item of page.section_nav) {
    const node = document.getElementById(item.id);
    if (!node) continue;
    if (node.getBoundingClientRect().top <= line) current = item.id;
  }
  if (current) activeId.value = current;
}

onMounted(() => {
  startSlides();
  const hashId = aboutHashId(route.hash);
  if (hashId) {
    const target = document.getElementById(hashId);
    if (target && Math.abs(target.getBoundingClientRect().top - 110) > 40) {
      const top = target.getBoundingClientRect().top + window.scrollY - 110;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }
  spy = new IntersectionObserver(syncActive, {
    rootMargin: "-110px 0px -55% 0px",
    threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
  });
  for (const item of page.section_nav) {
    const node = document.getElementById(item.id);
    if (node) spy.observe(node);
  }
  window.addEventListener("scroll", syncActive, { passive: true });
  syncActive();
});

onBeforeUnmount(() => {
  clearSlideTimers();
  spy?.disconnect();
  window.removeEventListener("scroll", syncActive);
});
</script>

<template>
  <div>
    <div
      class="hero-intro"
      :style="heroStyle"
      @mouseenter="onHeroEnter"
      @mouseleave="onHeroLeave"
    >
      <h1 class="hero-intro__title">{{ page.title }}</h1>
      <div class="hero-intro__body">
        <p>{{ page.about.body[0] }}</p>
      </div>
      <div class="hero-intro__links">
        <a
          v-for="item in page.about.contact_box.items"
          :key="item.href"
          :href="item.href"
          class="hero-intro__link hero-intro__link--regular"
        >
          {{ item.text }}
        </a>
      </div>
    </div>

    <div class="opportunities toc-layout">
      <nav class="toc-layout__nav">
        <a
          v-for="item in page.section_nav"
          :key="item.id"
          :href="`#${item.id}`"
          class="toc-layout__nav-item"
          :class="{ 'is-active': activeId === item.id }"
          @click="activeId = item.id"
        >
          {{ item.label }}
        </a>
      </nav>

      <div class="opportunities__content toc-layout__content">
        <div id="about" class="pitch">
          <div v-if="pitchSlide" class="pitch__image">
            <NuxtImg
              :src="mediaPath(pitchSlide.src)"
              :alt="pitchSlide.alt"
              width="1024"
              height="886"
              provider="none"
            />
          </div>
          <div class="pitch__text">
            <h2 class="pitch__title">{{ page.about.title }}</h2>
            <div class="pitch__body-text">
              <p v-for="(paragraph, index) in page.about.body" :key="index">
                {{ paragraph }}
              </p>
            </div>
          </div>
        </div>

        <div id="missions" class="benefits">
          <h2 class="benefits__title">{{ page.missions.title }}</h2>
          <p v-for="(paragraph, index) in page.missions.body" :key="index">
            {{ paragraph }}
          </p>
          <div class="benefits__items">
            <div
              v-for="item in page.missions.items"
              :key="item.title"
              class="benefits__item"
            >
              <div class="benefits__item-title">
                <NuxtImg
                  :src="mediaPath(item.icon.src)"
                  alt=""
                  width="30"
                  height="30"
                  provider="none"
                />
                <h3>{{ item.title }}</h3>
              </div>
              <div class="benefits__item-text">
                <p>{{ item.text }}</p>
              </div>
            </div>
          </div>
        </div>

        <div id="history" class="opportunities-posts">
          <h2 class="opportunities-posts__title">{{ page.history.title }}</h2>
          <div class="opportunities-posts__list">
            <div
              v-for="item in page.history.items"
              :key="item.year"
              class="opportunities-posts__list-item"
            >
              <div class="opportunities-posts__list-item-title">{{ item.year }}</div>
              <div class="benefits__item-text">
                <p v-for="(event, index) in item.events" :key="index">{{ event }}</p>
              </div>
            </div>
          </div>
        </div>

        <div id="board" class="people-group-list">
          <!-- TODO: board.excluded hidden duplicate cards are omitted. -->
          <IfpPeopleGroup :title="page.board.title" :people="boardPeople" />
        </div>

        <div id="past-boards">
          <h2 class="faqs__title">{{ page.past_boards.title }}</h2>
          <div class="faqs__list">
            <div
              v-for="(column, columnIndex) in pastColumns"
              :key="columnIndex"
              class="faqs__list-col"
            >
              <IfpAccordion
                v-for="(term, termIndex) in column"
                :key="term.tab"
                :label="term.tab"
                :open="columnIndex === 0 && termIndex === 0"
              >
                <template v-for="group in term.groups" :key="group.heading">
                  <h3>{{ group.heading }}</h3>
                  <ul>
                    <li
                      v-for="(member, index) in group.items"
                      :key="`${group.heading}-${index}`"
                    >
                      {{ member }}
                    </li>
                  </ul>
                </template>
              </IfpAccordion>
            </div>
          </div>
        </div>

        <div id="founders" class="opportunities-posts">
          <h2 class="opportunities-posts__title">{{ page.founders.title }}</h2>
          <div class="faqs__list">
            <div
              v-for="(column, columnIndex) in founderColumns"
              :key="columnIndex"
              class="faqs__list-col"
            >
              <div class="opportunities-posts__list">
                <div
                  v-for="row in column"
                  :key="row.name"
                  class="opportunities-posts__list-item"
                >
                  <div class="opportunities-posts__list-item-title">{{ row.name }}</div>
                  <div class="opportunities-posts__list-item-cta">{{ row.degree }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div id="committees">
          <div class="people-group-list">
            <IfpPeopleGroup
              :title="page.workgroups.title"
              :people="managers"
              expanded
            />
          </div>
          <div class="faqs__list">
            <div
              v-for="(column, columnIndex) in committeeColumns"
              :key="columnIndex"
              class="faqs__list-col"
            >
              <IfpAccordion
                v-for="group in column"
                :key="group.title"
                :label="group.title"
              >
                <p
                  v-for="(paragraph, index) in visibleParagraphs(
                    group.title,
                    group.body,
                  )"
                  :key="index"
                >
                  {{ paragraph }}
                </p>
                <p v-if="group.manager">
                  {{ page.workgroups.manager_label }} {{ group.manager.name }}
                </p>
                <p v-if="workgroupPath(group.title)" class="wg-acc-link">
                  <NuxtLink :to="workgroupPath(group.title) || '/workgroups'">
                    {{ site.ui.workgroupPage }}
                  </NuxtLink>
                </p>
              </IfpAccordion>
            </div>
          </div>
        </div>

        <div id="statute" class="expander-block">
          <h2 class="faqs__title">{{ navLabel("statute") }}</h2>
          <IfpAccordion
            v-for="chapter in page.statute.chapters"
            :key="chapter.title"
            :label="chapter.title"
          >
            <template v-for="article in chapter.articles" :key="article.title">
              <h3>{{ article.title }}</h3>
              <template v-for="(block, index) in article.content" :key="index">
                <p v-if="block.p">{{ block.p }}</p>
                <ul v-if="block.lines">
                  <li v-for="(line, lineIndex) in block.lines" :key="lineIndex">
                    {{ line }}
                  </li>
                </ul>
              </template>
            </template>
          </IfpAccordion>
        </div>
      </div>
    </div>

    <div id="contact">
      <div class="contact-hero">
        <div class="contact-hero__title">{{ page.contact.intro }}</div>
      </div>
      <div class="contact-split">
        <div class="contact-methods opportunities-posts">
          <div class="opportunities-posts__list">
            <div
              v-for="row in contactRows"
              :key="row.key"
              class="opportunities-posts__list-item"
            >
              <div class="opportunities-posts__list-item-title">{{ row.label }}</div>
              <a
                v-if="row.href"
                class="opportunities-posts__list-item-cta"
                :href="row.href"
              >
                {{ row.text }}
              </a>
              <div v-else class="opportunities-posts__list-item-cta">
                {{ row.text }}
              </div>
            </div>
            <div
              v-if="page.contact.social.length"
              class="opportunities-posts__list-item"
            >
              <div class="opportunities-posts__list-item-cta contact-methods__links">
                <a
                  v-for="item in page.contact.social"
                  :key="item.href"
                  :href="item.href"
                  :aria-label="socialLabel(item.type)"
                  :title="socialLabel(item.type)"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <SocialIcon :type="item.type" />
                </a>
              </div>
            </div>
          </div>
        </div>
        <form class="contact-card tghpform" @submit.prevent="submitContact">
          <div
            v-for="field in contactFields"
            :key="field.name"
            class="rwmb-field"
            :class="{ 'rwmb-field--wide': field.type === 'textarea' }"
          >
            <div class="rwmb-label">
              <label :for="fieldDomId(field.name)">
                {{ field.label }}
                <span v-if="field.required" class="rwmb-required" aria-hidden="true"
                  >*</span
                >
              </label>
            </div>
            <div class="rwmb-input">
              <select
                v-if="field.type === 'select'"
                :id="fieldDomId(field.name)"
                v-model="formValues[field.name]"
                :name="field.name"
                :aria-invalid="formErrors[field.name] ? true : undefined"
              >
                <option v-for="option in field.options" :key="option" :value="option">
                  {{ option }}
                </option>
              </select>
              <textarea
                v-else-if="field.type === 'textarea'"
                :id="fieldDomId(field.name)"
                v-model="formValues[field.name]"
                :name="field.name"
                rows="6"
                :aria-invalid="formErrors[field.name] ? true : undefined"
              />
              <input
                v-else
                :id="fieldDomId(field.name)"
                v-model="formValues[field.name]"
                :name="field.name"
                :type="field.type"
                :aria-invalid="formErrors[field.name] ? true : undefined"
              />
            </div>
            <p v-if="formErrors[field.name]" class="rwmb-error">
              {{ formErrors[field.name] }}
            </p>
          </div>
          <div class="rwmb-field rwmb-form-submit">
            <button class="rwmb-button" type="submit" :disabled="formPending">
              {{ page.contact.form.submit }}
            </button>
          </div>
          <p
            class="contact-card__status"
            :class="{
              'contact-card__status--success': formStatus === 'success',
              'contact-card__status--error': formStatus === 'error',
            }"
            role="status"
            aria-live="polite"
          >
            {{
              formStatus === "success"
                ? page.contact.form.messages.success
                : formStatus === "error"
                  ? page.contact.form.messages.error
                  : ""
            }}
          </p>
        </form>
      </div>
      <div class="contact-map">
        <iframe
          :src="page.contact.map.src"
          :title="page.contact.map.title"
          width="600"
          height="450"
        />
      </div>
    </div>
  </div>
</template>
