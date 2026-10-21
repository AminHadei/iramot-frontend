---
description: Commit, bump changesets, commit again
---

Do these three steps in order. Stop if a step fails.

1. Split the current changes into as many small meaningful commits as you can. One logical change per commit. Follow `.cursor/commands/commit.md` and `.agents/skills/git-conventions/SKILL.md`.

2. Run `pnpm changeset:version`. Do not change version numbers or `CHANGELOG.md` by hand. Follow `.agents/skills/changesets/SKILL.md`.

3. Commit only the files that command changed, with message `chore: apply changeset version bump`. Same commit rules as step 1: no trailers, no git identity changes. Do not push.
