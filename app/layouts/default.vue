<script setup lang="ts">
const { data: site } = await useSite();
</script>

<template>
  <div class="min-h-screen bg-paper font-sans text-ink">
    <AppHeader v-if="site" :site="site" />
    <main id="content">
      <slot />
    </main>
    <AppFooter v-if="site" :site="site" />
  </div>
</template>
