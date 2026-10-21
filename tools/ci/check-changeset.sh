#!/usr/bin/env bash
#
# Fails a PR check if no changeset was added.
# Escape hatch: add the "skip-changeset" label to the pull request.

set -euo pipefail

TARGET_BRANCH="${GITHUB_BASE_REF:-${TARGET_BRANCH:-main}}"

if [ -n "${PR_LABELS:-}" ]; then
  case ",${PR_LABELS}," in
    *,skip-changeset,*)
      echo "✓ 'skip-changeset' label is present on this PR — bypassing the check."
      exit 0
      ;;
  esac
fi

git fetch --depth=100 origin "$TARGET_BRANCH" >/dev/null 2>&1 || true

ADDED=$(
  git diff --name-only --diff-filter=A "origin/${TARGET_BRANCH}...HEAD" -- '.changeset/*.md' \
    | grep -v 'README\.md$' \
    || true
)

if [ -n "$ADDED" ]; then
  echo "✓ Changeset(s) added in this PR:"
  printf '%s\n' "$ADDED" | sed 's/^/    /'
  exit 0
fi

cat <<'EOF'

────────────────────────────────────────────────────────────────────────
  ✗ No changeset found in this PR
────────────────────────────────────────────────────────────────────────

This PR does not add a changeset file under .changeset/.
User-visible site changes need one.

  pnpm changeset   → commit the generated .changeset/*.md file

Or add the label `skip-changeset` for docs or tooling-only changes.

────────────────────────────────────────────────────────────────────────
EOF

exit 1
