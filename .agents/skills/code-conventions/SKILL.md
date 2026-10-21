---
name: code-conventions
description: Use when editing TypeScript or Vue under app/, or nuxt.config.ts. Points at the topic skills and the formatters.
---

# Code conventions — irmot

Read the topic skill before coding:

1. [`nuxt-app`](../nuxt-app/SKILL.md)
2. [`design-system`](../design-system/SKILL.md)
3. [`content-fa`](../content-fa/SKILL.md)
4. [`static-deploy`](../static-deploy/SKILL.md)

## Tooling

- Format: Prettier (`pnpm format:fix`), including Tailwind class order.
- Lint: ESLint flat config via `@nuxt/eslint` (`pnpm lint` / `pnpm lint:fix`). Stylistic rules are off; Prettier owns formatting.
- Types: `pnpm typecheck` (`nuxt typecheck`).
- Spelling: `pnpm spellcheck` (cspell). Persian script is ignored. Add project words to `.cspell/project-words.txt`.
- Full gate: `pnpm check`.
