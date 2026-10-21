# AGENTS.md — irmot

Orientation for AI agents on the static site of **انجمن مدیریت فناوری و نوآوری ایران**.

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

## Design

Structure, spacing, and components follow [ifp.org](https://ifp.org/), mirrored for RTL. Colours, type, and the mark are this association's, not IFP's. Normative rules: `.cursor/rules/project.mdc` and the `design-system` skill.

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

| Command    | File                          | What it does                                      |
| ---------- | ----------------------------- | ------------------------------------------------- |
| `/commit`  | `.cursor/commands/commit.md`  | Split work into small conventional commits        |
| `/release` | `.cursor/commands/release.md` | Commit, run `pnpm changeset:version`, commit bump |

## Agent rules

1. **Never `--no-verify`.** Fix hook failures at the root cause.
2. **Never commit without user confirmation.**
3. **Reversible local work** — proceed. **Destructive/remote** — confirm first.
4. **Simplicity and surgical scope.** Minimum diff; match existing style.
5. **Do not hand-edit `CHANGELOG.md` or `version`.** Use `pnpm changeset`.
6. **Verify site work** with `pnpm check`. Run `pnpm generate` when routes, content collections, or `nuxt.config.ts` change.
