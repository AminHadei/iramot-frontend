---
name: design-system
description: Use when changing layout, spacing, typography, colour, or component appearance. The living sheet is app/assets/css/ifp.rtl.css.
---

# Design system — irmot

The always-on rule is [`.cursor/rules/project.mdc`](../../../.cursor/rules/project.mdc). Follow it. This skill is the task-time reminder.

## Reference

The global sheet is [`app/assets/css/ifp.rtl.css`](../../../app/assets/css/ifp.rtl.css). Both Söhne and Tiempos Text map to `IRANYekan, Tahoma, sans-serif`. Colours in that sheet are `:root` custom properties, listed in [`docs/design-system.md`](../../../docs/design-system.md). Tailwind preflight is off; use Tailwind only for association-specific UI.

## Tokens

| Token            | Value     | Role               |
| ---------------- | --------- | ------------------ |
| `paper`          | `#FFFDF5` | Background         |
| `ink`            | `#2B2B33` | Text               |
| `primary`        | `#2D317A` | Headlines, links   |
| `secondary`      | `#6967AC` | Labels             |
| `secondary-soft` | `#9A96CA` | Soft fills         |
| `accent`         | `#6866AD` | Text, links, rules |
| `line`           | `#373737` | Rules              |

- Headings, body, and labels: IRANYekan (`font-heading`, `font-sans`, and `font-serif`), Tahoma fallback. The FaNum faces are the woff2 and woff files in `public/fonts/iranyekan/`.

## RTL

Logical properties only: `ms`/`me`, `ps`/`pe`, `start`/`end`, `text-start`. Never `left`/`right`, `ml`/`mr`, `pl`/`pr`, `text-left`/`text-right`.

Directional icons use `rtl:-scale-x-100`.

## Homepage shape

Header (mark at the start, nav at the end), hero, full-bleed focus rows, spotlight list, three-column projects, recent list, multi-column footer. Hairline `border-line` separators. Wide `page-wrap` measure.
