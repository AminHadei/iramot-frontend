<script setup lang="ts">
import { eventTiming, eventTone } from "~/data/events/programs";
import type { EventArticle, EventSpeakerRole } from "~/data/events/types";
import type { SiteContent } from "~/types/content";

const props = defineProps<{
  event: EventArticle;
  site: SiteContent;
}>();

const tone = computed(() => eventTone(props.event.program));
const programName = computed(
  () =>
    props.site.eventFilters.find(
      (filter) => filter.to === `/events/${props.event.program}`,
    )?.label ?? "",
);
const timing = computed(() => eventTiming(props.event.startsAt));
const when = computed(() => props.event.dateText || props.event.startsAt || "");
const modeLabel = computed(() => {
  const mode = props.event.mode ?? [];
  const parts = [
    mode.includes("in-person") ? props.site.ui.eventInPerson : "",
    mode.includes("online") ? props.site.ui.eventOnline : "",
  ].filter(Boolean);
  return parts.join(" و ");
});

function names(role: EventSpeakerRole) {
  return (props.event.speakers ?? [])
    .filter((speaker) => speaker.role === role)
    .map((speaker) => speaker.name)
    .join("، ");
}

const expert = computed(() => names("expert"));
const presenter = computed(() => names("presenter"));
const lead = computed(() => names("lead"));
const instructor = computed(() => names("instructor"));
const hasDetails = computed(
  () =>
    Boolean(when.value) ||
    Boolean(props.event.location) ||
    Boolean(modeLabel.value) ||
    Boolean(expert.value) ||
    Boolean(presenter.value) ||
    Boolean(lead.value) ||
    Boolean(instructor.value) ||
    Boolean(props.event.registrationUrl),
);
</script>

<template>
  <div>
    <article class="single-article news-article event-article" :style="tone">
      <nav class="news-breadcrumb" :aria-label="site.ui.navigation">
        <NuxtLink to="/events">{{ site.listings.events.title }}</NuxtLink>
        <span aria-hidden="true"> / </span>
        <NuxtLink :to="`/events/${event.program}`">{{ programName }}</NuxtLink>
        <span aria-hidden="true"> / </span>
        <span>{{ event.title }}</span>
      </nav>
      <header class="single-article__header">
        <div class="single-article__header-category">
          <NuxtLink
            class="single-article__header-category-container"
            :to="`/events/${event.program}`"
          >
            <div class="single-article__header-category-name">{{ programName }}</div>
          </NuxtLink>
          <div
            v-if="event.startsAt || event.dateText || timing"
            class="single-article__header-date"
          >
            <PersianDate v-if="event.startsAt" :date="event.startsAt" />
            <span v-else>{{ event.dateText }}</span>
            <span v-if="timing === 'past'" class="event-chip event-chip--past">{{
              site.ui.eventPast
            }}</span>
            <span
              v-else-if="timing === 'upcoming'"
              class="event-chip event-chip--upcoming"
              >{{ site.ui.eventUpcoming }}</span
            >
          </div>
        </div>
        <div class="single-article__header-title">
          <h1 class="single-article__header-title-primary">{{ event.title }}</h1>
        </div>
      </header>
      <div v-if="event.poster || hasDetails" class="event-top">
        <figure v-if="event.poster" class="event-poster">
          <img :src="event.poster" :alt="event.title" />
        </figure>
        <div v-if="hasDetails" class="event-details opportunities-posts">
          <h2 class="opportunities-posts__title">{{ site.ui.eventDetails }}</h2>
          <div class="opportunities-posts__list">
            <div v-if="when" class="opportunities-posts__list-item">
              <div class="opportunities-posts__list-item-title">
                {{ site.ui.eventTime }}
              </div>
              <div class="opportunities-posts__list-item-cta">
                <template v-if="event.dateText">{{ event.dateText }}</template>
                <PersianDate v-else-if="event.startsAt" :date="event.startsAt" />
              </div>
            </div>
            <div v-if="event.location" class="opportunities-posts__list-item">
              <div class="opportunities-posts__list-item-title">
                {{ site.ui.eventPlace }}
              </div>
              <div class="opportunities-posts__list-item-cta">{{ event.location }}</div>
            </div>
            <div v-if="modeLabel" class="opportunities-posts__list-item">
              <div class="opportunities-posts__list-item-title">
                {{ site.ui.eventMode }}
              </div>
              <div class="opportunities-posts__list-item-cta">{{ modeLabel }}</div>
            </div>
            <div v-if="expert" class="opportunities-posts__list-item">
              <div class="opportunities-posts__list-item-title">
                {{ site.ui.eventExpert }}
              </div>
              <div class="opportunities-posts__list-item-cta">{{ expert }}</div>
            </div>
            <div v-if="presenter" class="opportunities-posts__list-item">
              <div class="opportunities-posts__list-item-title">
                {{ site.ui.eventPresenter }}
              </div>
              <div class="opportunities-posts__list-item-cta">{{ presenter }}</div>
            </div>
            <div v-if="lead" class="opportunities-posts__list-item">
              <div class="opportunities-posts__list-item-title">
                {{ site.ui.eventLead }}
              </div>
              <div class="opportunities-posts__list-item-cta">{{ lead }}</div>
            </div>
            <div v-if="instructor" class="opportunities-posts__list-item">
              <div class="opportunities-posts__list-item-title">
                {{ site.ui.eventInstructor }}
              </div>
              <div class="opportunities-posts__list-item-cta">{{ instructor }}</div>
            </div>
            <div v-if="event.registrationUrl" class="opportunities-posts__list-item">
              <div class="opportunities-posts__list-item-title">
                {{ site.ui.eventRegister }}
              </div>
              <div class="opportunities-posts__list-item-cta">
                <a
                  class="event-register"
                  :href="event.registrationUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {{ site.ui.eventRegister }}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <main v-if="event.bodyHtml || event.videoUrl" class="single-article__content">
        <div class="article event-body">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div v-if="event.bodyHtml" class="article__content" v-html="event.bodyHtml" />
          <p v-if="event.videoUrl" class="event-video-link">
            <a :href="event.videoUrl" target="_blank" rel="noopener noreferrer">{{
              site.ui.eventVideo
            }}</a>
          </p>
        </div>
      </main>
    </article>
    <div
      v-if="event.related.length"
      class="post-listing-list post-listing-list--no-qty-columns"
    >
      <h2 class="news-related__title">{{ site.ui.eventRelated }}</h2>
      <div class="post-listing-list__list event-grid">
        <EventCard
          v-for="item in event.related"
          :key="item.id"
          :item="item"
          :site="site"
        />
      </div>
    </div>
  </div>
</template>
