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

Commit the generated `.changeset/*.md` with the change. Pick `patch`, `minor`, or `major` from what visitors notice.

## Version

On main, the Release workflow runs `pnpm changeset:version`, commits `CHANGELOG.md`, `package.json`, and the consumed changeset files, and pushes. Do not run that by hand unless asked. Cursor `/release` is that ask: it versions locally, commits, and does not push.

## Don't

- Don't edit `CHANGELOG.md` or the `version` field yourself.
- Don't skip a changeset for a user-visible page, content, or design change.
- Tooling-only pull requests may use the `skip-changeset` label instead. CI enforces this (`tools/ci/check-changeset.sh`).
