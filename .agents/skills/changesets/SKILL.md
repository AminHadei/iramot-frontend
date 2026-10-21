---
name: changesets
description: Use when a change is user-visible on the site, or when editing the changelog, package version, or files under .changeset/.
---

# Changesets — irmot

This is a single private package (`irmot`). Changesets write `CHANGELOG.md` and bump `package.json` `version`. Nothing is published to npm.

## Add one

```bash
pnpm changeset
```

Commit the generated `.changeset/*.md` with the change. Pick `patch`, `minor`, or `major` from what visitors notice. Write the summary in English. The changelog line is that summary alone, with no commit hash.

## Version

`/release` applies each pending changeset on its own, oldest first, and commits each bump. It does not push. Order is the commit date that added the file. A changeset that is not committed yet comes after those, oldest modification time first.

Do not run `pnpm changeset:version` on every pending changeset at once. Do not edit `CHANGELOG.md` or the `version` field yourself.

The Release workflow on main runs `pnpm changeset:version` for whatever changesets are still pending, commits, and pushes. Do not run that workflow unless asked.

## Don't

- Don't edit `CHANGELOG.md` or the `version` field yourself.
- Don't skip a changeset for a user-visible page, content, or design change.
- Tooling-only pull requests may use the `skip-changeset` label instead. CI enforces this (`tools/ci/check-changeset.sh`).
