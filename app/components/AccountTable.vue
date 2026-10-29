<script setup lang="ts">
defineProps<{
  columns: Array<{ key: string; label: string }>;
  rows: Array<Record<string, string>>;
  empty: string;
}>();
</script>

<template>
  <div class="overflow-x-auto border border-line">
    <table class="w-full border-collapse text-start">
      <thead>
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            scope="col"
            class="border-b border-line px-3 py-2 text-start text-sm font-bold"
          >
            {{ column.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!rows.length">
          <td :colspan="columns.length" class="px-3 py-6 text-secondary">
            {{ empty }}
          </td>
        </tr>
        <tr
          v-for="(row, index) in rows"
          :key="row.id || index"
          class="border-b border-line"
        >
          <td v-for="column in columns" :key="column.key" class="px-3 py-2 align-top">
            <slot :name="column.key" :row="row">{{ row[column.key] }}</slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
