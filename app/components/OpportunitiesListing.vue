<script setup lang="ts">
import type { Opportunity } from "~/data/opportunities/types";
import type { SiteContent } from "~/types/content";

const props = defineProps<{
  title: string;
  items: Opportunity[];
  page: number;
  pages: number;
  site: SiteContent;
}>();

function tehranDay(now: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tehran",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

const today = useState("opportunity-today", () => tehranDay(new Date()));

onMounted(() => {
  today.value = tehranDay(new Date());
});

function isEnded(deadline?: string) {
  return Boolean(deadline && deadline < today.value);
}

const pageLabel = computed(() => {
  if (props.pages < 2) return "";
  return props.site.ui.newsPage
    .replace("{current}", persianDigits(props.page))
    .replace("{total}", persianDigits(props.pages));
});

const previous = computed(() =>
  props.page > 1 ? listingPath("/opportunities", props.page - 1) : undefined,
);

const next = computed(() =>
  props.page < props.pages ? listingPath("/opportunities", props.page + 1) : undefined,
);
</script>

<template>
  <div>
    <div class="hero-intro hero-intro--compact">
      <h1 class="hero-intro__title">{{ title }}</h1>
    </div>
    <div class="people-group-list list-page">
      <p v-if="!items.length" class="list-empty">
        {{ site.ui.opportunitiesEmpty }}<br />{{ site.ui.opportunitiesEmpty2 }}
      </p>
      <ul v-else class="people-group__list list-grid">
        <li v-for="item in items" :key="item.id">
          <OpportunityCard
            :item="item"
            :ended="isEnded(item.deadline)"
            :cta="site.ui.opportunityCta"
            :deadline-label="site.ui.opportunityDeadline"
            :ended-label="site.ui.opportunityEnded"
            :research-label="site.ui.opportunityTypeResearch"
            :job-label="site.ui.opportunityTypeJob"
            :external-label="site.ui.listExternal"
          />
        </li>
      </ul>
      <PostPagination
        v-if="pageLabel"
        :previous="previous"
        :next="next"
        :previous-label="site.ui.previous"
        :next-label="site.ui.next"
        :page-label="pageLabel"
      />
    </div>
  </div>
</template>
