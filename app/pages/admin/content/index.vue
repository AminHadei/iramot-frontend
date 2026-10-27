<script setup lang="ts">
import { contentTypeConfigs } from "~/data/admin/contentTypes";

definePageMeta({ layout: "panel", middleware: "admin" });

const copy = await useAccountPage("contentTitle", "contentDescription");
</script>

<template>
  <div>
    <h1 class="font-heading text-4xl text-primary">{{ copy.seo.contentTitle }}</h1>
    <p class="mt-4 max-w-2xl">{{ copy.seo.contentDescription }}</p>
    <ul class="mt-8 grid list-none gap-3 p-0 md:grid-cols-2">
      <li
        v-for="item in contentTypeConfigs"
        :key="item.type"
        class="border border-line p-4"
      >
        <NuxtLink class="text-primary" :to="`/admin/content/${item.type}`">
          {{ copy.contentTypes[item.type] || item.type }}
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>
