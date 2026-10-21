---
name: nuxt-app
description: Use when editing app/pages, app/components, app/composables, app/layouts, or nuxt.config.ts. Covers Nuxt 4, Vue 3, script setup, and content-driven pages.
---

# Nuxt app — irmot

## Layout

```
app/
  app.vue
  pages/            # file routes
  components/       # auto-imported
  composables/      # auto-imported use*
  layouts/
  utils/
  types/
  assets/css/
  providers/        # Nuxt Image providers
content/            # @nuxt/content sources
content.config.ts
nuxt.config.ts
```

## Vue / TypeScript

- `<script setup lang="ts">` only.
- Typed props via `defineProps<{ ... }>()`.
- No `any`. Narrow `unknown` at boundaries.
- Named exports in composables and utils.

## Data

- Read copy with `queryCollection`. Do not hardcode interface or body text.
- Images go through `NuxtImg`.
- Every page calls `usePageSeo` (Persian title, description, `ogLocale: fa_IR`).

## Config

- `app.head.htmlAttrs` stays `{ lang: 'fa', dir: 'rtl' }`.
- Static output is `nuxt generate` (`routeRules` prerender + `nitro.prerender.crawlLinks`).
- New routes must be linked from a crawled page so generate discovers them.

## Don't

- Don't add `server/` routes for content that belongs in `content/`.
- Don't introduce a UI kit for layout this site already builds with Tailwind.
