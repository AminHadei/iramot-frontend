---
name: design-system
description: Use when changing layout, spacing, typography, colour, or component appearance. RTL mirror of ifp.org with this association's tokens.
---

# Design system — irmot

The always-on rule is [`.cursor/rules/project.mdc`](../../../.cursor/rules/project.mdc). Follow it. This skill is the task-time reminder.

## Reference

The global sheet is [`app/assets/css/ifp.rtl.css`](../../../app/assets/css/ifp.rtl.css): rtlcss output of `ref/ifp/css/main.css` and the `<style>` blocks in `ref/ifp/html/`. Söhne maps to Vazirmatn and Tiempos Text maps to Noto Naskh Arabic. IFP colours in that sheet are `:root` custom properties, listed in [`docs/design-system.md`](../../../docs/design-system.md). Do not ship the IFP font files or the IFP mark. Tailwind preflight is off; use Tailwind only for association-specific UI.

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

- Headings: `font-heading` (Noto Naskh Arabic).
- Body and labels: `font-sans` (Vazirmatn, Tahoma fallback). Self-host the woff2 files with `@fontsource/vazirmatn`.
- Do not commit unlicensed IRANYekan files. When the licensed FaNum woff2 files are available, they replace Vazirmatn.

## RTL

Logical properties only: `ms`/`me`, `ps`/`pe`, `start`/`end`, `text-start`. Never `left`/`right`, `ml`/`mr`, `pl`/`pr`, `text-left`/`text-right`.

Directional icons use `rtl:-scale-x-100`.

## Homepage shape

Header (mark at the start, nav at the end), hero, full-bleed focus rows, spotlight list, three-column projects, recent list, multi-column footer. Hairline `border-line` separators. Wide `page-wrap` measure.
