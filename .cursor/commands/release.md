---
description: Commit, then apply each pending changeset in date order
---

Do these steps in order. Stop if a step fails.

1. Split the current changes into as many small meaningful commits as you can. One logical change per commit. Follow `.cursor/commands/commit.md` and `.agents/skills/git-conventions/SKILL.md`. If the tree is already clean, go to step 2.

2. Apply pending changesets one at a time, oldest first. Do not change version numbers or `CHANGELOG.md` by hand. Follow `.agents/skills/changesets/SKILL.md`.

   A pending changeset is a `.changeset/*.md` file other than `README.md`. If there are none, stop.

   Order by the commit date that added the file (`git log --diff-filter=A --format=%aI`). Oldest first. A changeset that has no commit yet sorts after the committed ones, and those sort by file modification time, oldest first.

   When only one changeset is pending, run `pnpm changeset:version`, then commit only the files that command changed.

   When several are pending, repeat until none remain:

   - Leave only the oldest remaining changeset in `.changeset/`. Move every other pending changeset to a temporary directory outside the repository.
   - Run `pnpm changeset:version`.
   - Move the other changesets back. If the version command failed, move them back and stop.
   - Commit only the files that command changed.

   Each of those commits uses the message `chore: apply changeset version bump`.

3. Same commit rules as step 1: no trailers, no git identity changes. Use only `git commit -m "message"`. Do not push.
