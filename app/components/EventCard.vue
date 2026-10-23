<script setup lang="ts">
import { eventTiming, eventTone } from "~/data/events/programs";
import type { EventSummary } from "~/data/events/types";
import type { SiteContent } from "~/types/content";

const props = defineProps<{
  item: EventSummary;
  site: SiteContent;
  featured?: boolean;
}>();

const tone = computed(() => eventTone(props.item.program));
const programName = computed(
  () =>
    props.site.eventFilters.find(
      (filter) => filter.to === `/events/${props.item.program}`,
    )?.label ?? "",
);
const dateLabel = computed(() => {
  if (props.item.startsAt) return formatPersianDate(props.item.startsAt);
  return props.item.dateText ?? "";
});
const timing = computed(() => eventTiming(props.item.startsAt));
</script>

<template>
  <div
    class="post-listing news-card event-card"
    :class="{ 'post-listing--featured': featured }"
    :style="tone"
  >
    <NuxtLink
      class="post-listing__anchor"
      :to="`/events/${item.slug}`"
      :aria-label="item.title"
    />
    <div class="post-listing__category">
      <div class="post-listing__category-name">{{ programName }}</div>
    </div>
    <div class="post-listing__image">
      <img v-if="item.poster" :src="item.poster" :alt="item.title" />
      <div v-else class="event-card__placeholder">
        <span>{{ programName }}</span>
      </div>
    </div>
    <div class="post-listing__content">
      <div class="post-listing__title">{{ item.title }}</div>
      <div v-if="dateLabel || timing" class="post-listing__meta">
        <div class="post-listing__info">
          <div v-if="dateLabel" class="post-listing__date">{{ dateLabel }}</div>
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
    </div>
  </div>
</template>
