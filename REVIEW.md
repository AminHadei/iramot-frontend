# REVIEW.md — irmot

Severity calibration for code review. Used by the `code-review` skill.

## Blocker

- `pnpm build` fails.
- A new `server/api` route for content that belongs in the content API.
- RTL regressions: physical `left`/`right` / `ml` / `mr` / `pl` / `pr` where logical properties are required.
- Directional icons (arrow, chevron) shipped without `rtl:-scale-x-100`.
- Copy or interface text hardcoded in a component instead of the API or `app/copy/panel.json`.
- `html` `lang` or `dir` no longer `fa` / `rtl`.

## Major

- Design drift from the IFP-derived structure, or IFP fonts/logo copied in.
- Colours or fonts outside `paper`, `ink`, `primary`, `secondary`, `secondary-soft`, `accent`, `line`, `font-heading`, `font-sans`.
- A page without `usePageSeo`.
- Dates shown in Gregorian form or with Latin digits.
- Placeholder copy added without `placeholder: true`.
- `CHANGELOG.md` or `package.json` `version` edited by hand.

## Minor

- Missing Jalali formatting via `formatPersianDate` for a new date field.
- Inconsistent section rhythm against the homepage (hero, ruled rows, three-column projects).
- A new dependency for something the current stack already covers.

## Nit

- Import order, naming, or comment wording.
- Copy polish that does not change meaning.
