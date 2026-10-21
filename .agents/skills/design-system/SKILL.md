---
name: design-system
description: Use when changing layout, spacing, typography, colour, or component appearance. RTL mirror of ifp.org with this association's tokens.
---

# Design system — irmot

The always-on rule is [`.cursor/rules/project.mdc`](../../../.cursor/rules/project.mdc). Follow it. This skill is the task-time reminder.

## Reference

Take structure, spacing, grid, and component patterns from [ifp.org](https://ifp.org/) and mirror them for RTL. Measured values live in [`docs/design-system.md`](../../../docs/design-system.md). Do not copy IFP fonts (Tiempos, Söhne) or the IFP mark.

## Tokens

| Token            | Value     | Role             |
| ---------------- | --------- | ---------------- |
| `paper`          | `#FFFDF5` | Background       |
| `ink`            | `#2B2B33` | Text             |
| `primary`        | `#2D317A` | Headlines, links |
| `secondary`      | `#6967AC` | Labels           |
| `secondary-soft` | `#9A96CA` | Soft fills       |
| `accent`         | `#CF4382` | Emphasis         |
| `line`           | `#373737` | Rules            |

- Headings: `font-heading` (Noto Naskh Arabic).
- Body and labels: `font-sans` (IRANYekan FaNum, Tahoma fallback).
- Licensed woff2 files belong in `app/assets/fonts/iranyekan/`. Do not download or commit unlicensed font files.

## RTL

Logical properties only: `ms`/`me`, `ps`/`pe`, `start`/`end`, `text-start`. Never `left`/`right`, `ml`/`mr`, `pl`/`pr`, `text-left`/`text-right`.

Directional icons use `rtl:-scale-x-100`.

## Homepage shape

Header (mark at the start, nav at the end), hero, full-bleed focus rows, spotlight list, three-column projects, recent list, multi-column footer. Hairline `border-line` separators. Wide `page-wrap` measure.
