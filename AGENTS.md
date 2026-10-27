# AGENTS.md — irmot

Orientation for AI agents on the static site of the **Iran Technology and Innovation Management Association**.

Claude Code: `CLAUDE.md` → `@AGENTS.md`. Cursor / Codex / others: read this file directly.

## Project snapshot

| Item     | Value                                                             |
| -------- | ----------------------------------------------------------------- |
| Stack    | Nuxt 4, Vue 3, TypeScript, Tailwind CSS 3 (`@nuxtjs/tailwindcss`) |
| Content  | `@nuxt/content` collections, queried with `queryCollection`       |
| Images   | `@nuxt/image` (`NuxtImg`)                                         |
| Output   | Static only — `pnpm generate` → `.output/public`                  |
| Language | Persian, `dir="rtl"`, `lang="fa"`                                 |
| App dir  | `app/` (pages, components, composables, layouts)                  |
| Content  | `content/`                                                        |
| Dev      | `pnpm dev` — `TMPDIR=/tmp` (macOS Nuxt socket fix)                |
| Package  | pnpm. Checks: `pnpm check`. Changelog: Changesets                 |

**Hard constraint:** production is a static host. Prerender every route. Do not add runtime `server/api` for content that belongs in `content/`.

Membership, admin, and auth routes are client-rendered (`ssr: false`) and call `NUXT_PUBLIC_API_BASE` when it is set. Empty `apiBase` keeps JSON content and hides account links. Contract and routes: [`docs/membership.md`](docs/membership.md).

## Design

هدف، کپی ۱:۱ مارکاپ و CSS سایت ifp.org است، آینه‌شده برای RTL. فقط متن، تصاویر، لوگو و فونت عوض می‌شوند. هیچ کامپوننتی از روی توضیح متنی بازسازی نمی‌شود؛ منبع حقیقت فایل‌های ref/ifp/ است. کلاس‌های اصلی IFP (site-header، home-splash، home-spotlight-intro، post-listing__*، project-list--layout-3-col، newsletter-pre-footer، site-footer و...) دقیقاً حفظ شوند.

Measured IFP values are in [`docs/design-system.md`](docs/design-system.md). The page inventory is [`docs/ifp-sitemap.md`](docs/ifp-sitemap.md). Which IRAMOT archive feeds which template is [`docs/mapping.md`](docs/mapping.md). Normative rules: `.cursor/rules/project.mdc` and the `design-system` skill.

## Skills (load on demand)

Canonical: [`.agents/skills/`](./.agents/skills/). Cursor: [`.cursor/rules/`](./.cursor/rules/). Claude: [`.claude/skills/`](./.claude/skills/) (shims).

| Skill              | When                                    |
| ------------------ | --------------------------------------- |
| `nuxt-app`         | `app/**`, `nuxt.config.ts`, Vue/TS      |
| `design-system`    | Layout, type, colour, RTL               |
| `content-fa`       | Persian copy and `content/`             |
| `static-deploy`    | Generate, GitHub Actions, prerender     |
| `code-conventions` | Cross-cutting Vue/TS and tooling        |
| `git-conventions`  | Commits, branches, hooks                |
| `pre-commit`       | Verification before declaring work done |
| `changesets`       | Changelog, version, `.changeset/`       |
| `code-review`      | PR / diff review via `REVIEW.md`        |
| `doc-authoring`    | Handbook docs and ADRs                  |

## Cursor commands

| Command    | File                          | What it does                                            |
| ---------- | ----------------------------- | ------------------------------------------------------- |
| `/commit`  | `.cursor/commands/commit.md`  | Split work into small conventional commits              |
| `/release` | `.cursor/commands/release.md` | Commit, then apply each pending changeset in date order |

## Agent rules

1. **Never `--no-verify`.** Fix hook failures at the root cause.
2. **Never commit without user confirmation.**
3. **Reversible local work** — proceed. **Destructive/remote** — confirm first.
4. **Simplicity and surgical scope.** Minimum diff; match existing style.
5. **Do not hand-edit `CHANGELOG.md` or `version`.** Use `pnpm changeset`.
6. **Verify site work** with `pnpm check`. Run `pnpm generate` when routes, content collections, or `nuxt.config.ts` change.
