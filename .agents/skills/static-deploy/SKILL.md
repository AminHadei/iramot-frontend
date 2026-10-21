---
name: static-deploy
description: Use when changing static generation, GitHub Actions, prerender routes, or the production host. The site is static-only.
---

# Static deploy — irmot

## Build

```bash
pnpm generate
# output: .output/public/
```

`nuxt generate` prerenders `/` and every linked route (`nitro.prerender.crawlLinks`, `routeRules: { '/**': { prerender: true } }`). A page that is not linked will not be in the output.

## CI

| Workflow                        | When             | What                                                            |
| ------------------------------- | ---------------- | --------------------------------------------------------------- |
| `.github/workflows/ci.yml`      | PR and push main | lint, format, spellcheck, typecheck, generate, changeset on PRs |
| `.github/workflows/deploy.yml`  | push main        | generate and GitHub Pages                                       |
| `.github/workflows/release.yml` | manual           | `changeset version`, commit changelog                           |

Install in CI sets `HUSKY=0`.

## baseURL

GitHub Pages serves this project site at `/irmot/`. CI and deploy set `NUXT_APP_BASE_URL=/irmot/` for `pnpm generate`, and `app.baseURL` reads that variable. Local dev stays at `/`. Change the two together. A stylesheet or font URL written as a root path (`/fonts/...`) is not prefixed.

## Don't

- Don't add a Node runtime dependency for content.
- Don't switch the production command from `pnpm generate` to `nuxt build` without a server host.
