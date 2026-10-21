---
name: doc-authoring
description: Use when writing developer docs or ADRs. Single source of truth, current-reality only.
---

# Doc authoring — irmot

## Principles

1. One source of truth. Skills and Cursor rules point at it; they do not restate it.
2. Current reality only.
3. Terse: tables and bullets.
4. Site copy stays Persian in `content/`. Developer docs stay English.

## When `docs/` exists

```
docs/
  decisions/NNNN-short-title.md   # Context, Decision, Consequences
```

## After adding a doc

- Link it from `AGENTS.md` if agents must find it.
- Add a skill pointer only if agents must follow it while working.

## Don't

- Don't duplicate `.cursor/rules/project.mdc`, `AGENTS.md`, or an existing skill.
- Don't put Persian page copy in developer docs.
