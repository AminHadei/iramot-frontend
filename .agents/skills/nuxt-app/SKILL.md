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
  copy/             # account UI strings
nuxt.config.ts
```

## Vue / TypeScript

- `<script setup lang="ts">` only.
- Typed props via `defineProps<{ ... }>()`.
- No `any`. Narrow `unknown` at boundaries.
- Named exports in composables and utils.

## Data

- Read public content from the API with `useAsyncData`. Account strings live in `app/copy/panel.json`.
- Images go through `NuxtImg`.
- Every page calls `usePageSeo` (Persian title, description, `ogLocale: fa_IR`).
- A missing public record throws `createError({ statusCode: 404 })`.

## Config

- `app.head.htmlAttrs` stays `{ lang: 'fa', dir: 'rtl' }`.
- Production is `pnpm build` and `node .output/server/index.mjs`.
- Account, admin, and payment routes stay `ssr: false`.

## Don't

- Don't add `server/api` routes for content. Content belongs in the API.
- Don't introduce a UI kit for layout this site already builds with Tailwind.
