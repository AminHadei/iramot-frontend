---
name: content-fa
description: Use when writing or editing Persian copy in content/. Covers voice, orthography, Jalali dates, and the placeholder flag.
---

# Persian content — irmot

## Where copy lives

| Collection | Path                    | Role                          |
| ---------- | ----------------------- | ----------------------------- |
| `site`     | `content/site.yml`      | Name, nav, footer, UI strings |
| `home`     | `content/home.yml`      | Hero and section titles       |
| `areas`    | `content/areas/*.yml`   | Focus rows                    |
| `posts`    | `content/research/*.md` | Research                      |
| `projects` | `content/projects/*.md` | Projects                      |
| `pages`    | `content/about.md`      | About                         |

Do not hardcode these strings in Vue files.

## Voice

The association speaks as an institution: specific, calm, no hype. Temporary copy is original Persian, not a translation of IFP articles, and is marked `placeholder: true`.

## Orthography

- ZWNJ where Persian requires it: «می‌شود», «نسخه‌ها».
- Persian quotation marks «…».
- Store dates as ISO `YYYY-MM-DD`. Display them with `formatPersianDate` (Jalali, Persian digits).
- Do not put Persian digits in frontmatter dates.

## Slugs

Latin kebab-case filenames. Numeric prefixes (`01.`) set list order and are stripped from the public path.
