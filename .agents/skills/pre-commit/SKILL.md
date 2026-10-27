---
name: pre-commit
description: Use before declaring work done, or when a Husky hook fails. Runs the check pipeline and the server build when the site changed.
---

# Pre-commit — irmot

```bash
pnpm check
```

`check` is typecheck, lint, Prettier `--check`, and cspell.

If lint or format failed on something auto-fixable:

```bash
pnpm check:fix
```

Also run `pnpm build` when the change touches `app/`, `nuxt.config.ts`, or `.github/workflows/`.

## Report

List each step as pass or fail with the error snippet. Do not commit unless the user asks.

## Don't

- Don't use `--no-verify`.
- Don't skip `build` for route or config changes.
- Don't hand-edit `CHANGELOG.md`. Add a changeset for user-visible work (`changesets` skill).
