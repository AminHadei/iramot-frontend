---
name: static-deploy
description: Use when changing the production build, Docker, Nginx, or GitHub Actions.
---

# Deploy — irmot

Production is a Nuxt server. See [`docs/deployment.md`](../../../docs/deployment.md).

```bash
pnpm build
node .output/server/index.mjs
```

## CI

| Workflow                        | When             | What                                                        |
| ------------------------------- | ---------------- | ----------------------------------------------------------- |
| `.github/workflows/ci.yml`      | PR and push main | lint, format, spellcheck, typecheck, test, build, changeset |
| `.github/workflows/release.yml` | manual           | `changeset version`, commit changelog                       |

Install in CI sets `HUSKY=0`.

## Don't

- Don't prerender the public site or publish it to GitHub Pages.
- Don't add `server/api` routes for content. Content belongs in the API.
