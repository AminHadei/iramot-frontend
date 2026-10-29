---
name: content-fa
description: Use when writing Persian interface copy. Covers voice, orthography, and Jalali dates.
---

# Persian copy — irmot

## Where copy lives

Account and admin strings live in `app/copy/panel.json`. There is no `content/` directory. Public page titles and bodies come from the content API. Do not hardcode those strings in Vue files.

## Voice

The association speaks as an institution: specific, calm, no hype.

## Orthography

- ZWNJ where Persian requires it: «می‌شود», «نسخه‌ها».
- Persian quotation marks «…».
- Store dates as ISO `YYYY-MM-DD`. Display them with `formatPersianDate` (Jalali, Persian digits).
- Do not put Persian digits in stored dates.
