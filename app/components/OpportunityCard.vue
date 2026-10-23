<script setup lang="ts">
import type { Opportunity } from "~/data/opportunities/types";

const props = defineProps<{
  item: Opportunity;
  ended: boolean;
  cta: string;
  deadlineLabel: string;
  endedLabel: string;
  researchLabel: string;
  jobLabel: string;
  externalLabel: string;
}>();

const typeLabel = computed(() => {
  if (props.item.type === "research") return props.researchLabel;
  if (props.item.type === "job") return props.jobLabel;
  return "";
});

const deadlineText = computed(() =>
  props.item.deadline
    ? `${props.deadlineLabel} ${formatPersianDate(props.item.deadline)}`
    : "",
);
</script>

<template>
  <IfpListCard
    opportunity
    wide
    :name="item.title"
    :tone="item.tone"
    :image="item.image"
    :description="item.description"
    :initials-source="item.organization || item.title"
    :ended="ended"
    :links="[{ href: item.url, label: cta }]"
    :external-label="externalLabel"
  >
    <template v-if="typeLabel || item.organization" #meta>
      <p class="list-card__meta">
        <span v-if="typeLabel" class="list-card__type">{{ typeLabel }}</span>
        <span v-if="item.organization" class="list-card__type">{{
          item.organization
        }}</span>
      </p>
    </template>
    <template v-if="deadlineText || ended" #foot>
      <div class="list-card__foot">
        <p v-if="deadlineText" class="list-card__deadline">
          <time :datetime="item.deadline">{{ deadlineText }}</time>
        </p>
        <span v-if="ended" class="list-card__badge">{{ endedLabel }}</span>
      </div>
    </template>
  </IfpListCard>
</template>
