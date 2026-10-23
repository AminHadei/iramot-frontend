<script setup lang="ts">
defineProps<{
  type: string;
}>();
</script>

<template>
  <svg v-if="type === 'linkedin'" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="currentColor"
      d="M4.98 3.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0zM.5 8.5h4V24h-4V8.5zM8.5 8.5h3.8v2.1h.1c.5-1 1.8-2.1 3.8-2.1 4 0 4.8 2.6 4.8 6V24h-4v-7.7c0-1.8 0-4.1-2.5-4.1s-2.9 2-2.9 4V24h-4V8.5z"
    />
  </svg>
  <svg v-else-if="type === 'telegram'" viewBox="0 0 23 22" aria-hidden="true">
    <path
      fill="currentColor"
      d="M11.5 0C5.1 0 0 4.9 0 11s5.1 11 11.5 11S23 17.1 23 11 17.9 0 11.5 0Zm5.3 7.5-1.8 8.4c-.1.6-.5.8-1 .5l-2.8-2.1-1.3 1.3c-.2.1-.3.2-.6.2l.2-2.8 5.1-4.6c.2-.2 0-.3-.3-.1l-6.3 4-2.7-.8c-.6-.2-.6-.6.1-.9l10.6-4.1c.5-.2.9.1.8 1Z"
    />
  </svg>
  <svg v-else-if="type === 'instagram'" viewBox="0 0 23 22" aria-hidden="true">
    <path
      fill="currentColor"
      d="M16.2 0H6.8C3.1 0 .1 2.9.1 6.5v9c0 3.6 3 6.5 6.7 6.5h9.4c3.7 0 6.7-2.9 6.7-6.5v-9C22.9 2.9 19.9 0 16.2 0Zm4.2 15.5c0 2.2-1.9 4-4.2 4H6.8c-2.3 0-4.2-1.8-4.2-4v-9c0-2.2 1.9-4 4.2-4h9.4c2.3 0 4.2 1.8 4.2 4v9ZM11.5 5.4A5.6 5.6 0 1 0 17 11a5.6 5.6 0 0 0-5.5-5.6Zm0 9.2A3.6 3.6 0 1 1 15 11a3.6 3.6 0 0 1-3.5 3.6ZM17.6 4.2a1.3 1.3 0 1 0 1.3 1.3 1.3 1.3 0 0 0-1.3-1.3Z"
    />
  </svg>
  <svg v-else viewBox="0 0 24 24" aria-hidden="true">
    <circle
      cx="12"
      cy="12"
      r="9"
      fill="none"
      stroke="currentColor"
      stroke-width="1.6"
    />
    <ellipse
      cx="12"
      cy="12"
      rx="4"
      ry="9"
      fill="none"
      stroke="currentColor"
      stroke-width="1.6"
    />
    <path
      d="M3 12h18M4.8 7.5h14.4M4.8 16.5h14.4"
      fill="none"
      stroke="currentColor"
      stroke-width="1.6"
    />
  </svg>
</template>
