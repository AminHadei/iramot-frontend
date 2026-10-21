---
name: code-review
description: Use when reviewing a PR, branch, or diff. Loads REVIEW.md for severity.
---

# Code review — irmot

Read [`REVIEW.md`](../../../REVIEW.md) in full. It overrides default review behaviour.

## Procedure

1. Read `AGENTS.md`.
2. Read `REVIEW.md`.
3. Review `git diff main...HEAD`.
4. Cite `file:line` and quote the offending code.
5. Report tally, intent, then findings.

## Focus

- RTL logical properties and mirrored icons
- Content from `content/`, `placeholder: true` on temporary copy
- `usePageSeo` on pages
- Jalali dates
- `pnpm generate` still prerenders linked routes
- Changelog left to Changesets

## Don't

- Auto-fix, commit, or push unless asked.
- Report `.output/`, `.nuxt/`, or `node_modules/`.
