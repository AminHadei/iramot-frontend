# AGENTS.md — irmot

Orientation for AI agents on the site of the **Iran Technology and Innovation Management Association**.

Claude Code: `CLAUDE.md` → `@AGENTS.md`. Cursor / Codex / others: read this file directly.

## Project snapshot

| Item     | Value                                                             |
| -------- | ----------------------------------------------------------------- |
| Stack    | Nuxt 4, Vue 3, TypeScript, Tailwind CSS 3 (`@nuxtjs/tailwindcss`) |
| Content  | HTTP API, read with `useAsyncData` on the server                  |
| Images   | `@nuxt/image` (`NuxtImg`)                                         |
| Output   | `pnpm build`, then `node .output/server/index.mjs`                |
| Language | Persian, `dir="rtl"`, `lang="fa"`                                 |
| App dir  | `app/` (pages, components, composables, layouts)                  |
| UI copy  | `app/copy/panel.json`                                             |
| Dev      | `pnpm dev` — `TMPDIR=/tmp` (macOS Nuxt socket fix)                |
| Package  | pnpm. Checks: `pnpm check`. Changelog: Changesets                 |

Public pages call the content API at request time. On the server, `NUXT_API_BASE_INTERNAL` wins when it is set; otherwise the server uses `NUXT_PUBLIC_API_BASE`. The browser uses only the public origin. Account, admin, and payment routes stay `ssr: false`. Contract: [`docs/membership.md`](docs/membership.md). Host setup: [`docs/deployment.md`](docs/deployment.md).

Do not add `server/api` routes for content. Content belongs in the API.

## Design

Keep the class names and layout in `app/assets/css/ifp.rtl.css` and the current templates. Colours, type, and RTL rules are in [`docs/design-system.md`](docs/design-system.md) and `.cursor/rules/project.mdc`.

## Skills (load on demand)

Canonical: [`.agents/skills/`](./.agents/skills/). Cursor: [`.cursor/rules/`](./.cursor/rules/). Claude: [`.claude/skills/`](./.claude/skills/) (shims).

| Skill              | When                                    |
| ------------------ | --------------------------------------- |
| `nuxt-app`         | `app/**`, `nuxt.config.ts`, Vue/TS      |
| `design-system`    | Layout, type, colour, RTL               |
| `content-fa`       | Persian UI copy and Jalali dates        |
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
6. **Verify site work** with `pnpm check`. Run `pnpm build` when routes or `nuxt.config.ts` change.
