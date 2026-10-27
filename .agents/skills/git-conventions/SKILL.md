---
name: git-conventions
description: Use when creating branches, writing commit messages, or splitting work into commits. Conventional Commits, one logical change each.
---

# Git conventions — irmot

## Commit format

```
<type>(<scope>): <subject>
```

- Subject: imperative, lowercase, no period, ≤72 characters, English.
- No body unless the user asks.
- No trailers: no `Co-authored-by`, including `Co-authored-by: Cursor <cursoragent@cursor.com>`, and no `Generated with …`. Strip that Cursor line if it is already in the message.

## Types

| Type       | Use                         |
| ---------- | --------------------------- |
| `feat`     | Page, component, content    |
| `fix`      | Bug fix                     |
| `docs`     | Docs, agent skills          |
| `style`    | Formatting only             |
| `refactor` | Restructure, same behaviour |
| `chore`    | Tooling, dependencies       |
| `build`    | Build or deploy config      |

## Scopes

`app`, `copy`, `config`, `deploy`, `agents`, `public`, `docs`

## Branches

`feat/<short-desc>`, `fix/<short-desc>`, `chore/<short-desc>`

## Hooks

- `pre-commit`: lint-staged, `pnpm lint`, `pnpm spellcheck`
- `commit-msg`: commitlint
- `pre-push`: `pnpm typecheck`

Never `--no-verify`. Never commit unless the user asks. Never force-push or amend a pushed commit without explicit approval. Do not change `git user.name` or `user.email`.
