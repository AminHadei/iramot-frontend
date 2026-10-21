---
description: Split work into small conventional commits with no trailer
---

Split the current changes into as many small meaningful commits as you can. One logical change per commit.

Each message is Conventional Commits: a type, an optional scope, and an imperative lowercase subject. The whole header stays under 72 characters. No body unless the why is not obvious. No Co-authored-by, Made-with, or any other trailer. Do not change git user.name or user.email. Use only `git commit -m "message"`.

Example: `chore: add prettier config`

Follow `.agents/skills/git-conventions/SKILL.md`.
