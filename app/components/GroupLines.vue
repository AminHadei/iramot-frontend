<script setup lang="ts">
import biotechnology from "~/assets/icons/groups/biotechnology.svg?raw";
import emerging from "~/assets/icons/groups/emerging.svg?raw";
import immigration from "~/assets/icons/groups/immigration.svg?raw";
import infrastructure from "~/assets/icons/groups/infrastructure.svg?raw";
import metascience from "~/assets/icons/groups/metascience.svg?raw";

const icons = [metascience, immigration, biotechnology, infrastructure, emerging];

const props = defineProps<{ index: number }>();

const markup = computed(() => icons[props.index % icons.length] ?? icons[0]);
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div class="spotlight-category__icon" aria-hidden="true" v-html="markup" />
</template>
