# IFP design system

هدف، کپی ۱:۱ مارکاپ و CSS سایت ifp.org است، آینه‌شده برای RTL. فقط متن، تصاویر، لوگو و فونت عوض می‌شوند. هیچ کامپوننتی از روی توضیح متنی بازسازی نمی‌شود؛ منبع حقیقت فایل‌های ref/ifp/ است. کلاس‌های اصلی IFP (site-header، home-splash، home-spotlight-intro، post-listing__*، project-list--layout-3-col، newsletter-pre-footer، site-footer و...) دقیقاً حفظ شوند.

Measured from the files in `ref/ifp/`. Nothing here is inferred.

Sources:

- Critical `<style>` in `ref/ifp/html/home.html`, unless a rule is marked otherwise.
- `ref/ifp/css/main.css`, from the URL in `ref/ifp/css/SOURCE.txt`.
- Inline `style` attributes in the saved HTML, named by file.

WordPress `--wp--preset--*` custom properties are declared in the home critical CSS. They are the bundled WordPress presets, not selectors on the IFP components below, so they are not copied into these tables.

## Colour

Declared on `:root` in the home critical CSS:

| Property                  | Value     | Where                                                 |
| ------------------------- | --------- | ----------------------------------------------------- |
| `--color-accent`          | `#373737` | `:root`                                               |
| `--color-body-background` | `#FFFFFF` | `:root` inside `@media (prefers-contrast: more)` only |

The `body` rule uses `background: var(--color-body-background, #FFFEF2)` and `color: #373737`. `#FFFEF2` is the fallback in that declaration. It is not assigned to `--color-body-background` outside the contrast query.

Other colours that appear on the components below: `#FFFEF2` (splash and footer text, also written `#fffef2`), `#999` (post meta, project subtitle), `#ff9762` (project links; spotlight title band and posts title in `main.css`), `#b17ada` (inline on the home splash, and `.person-card__image` background in `main.css`).

## Spacing

Declared on `:root` in the home critical CSS, after the breakpoint variables:

| Property            | Value  |
| ------------------- | ------ |
| `--gutter`          | `30px` |
| `--small-spacing`   | `16px` |
| `--default-spacing` | `24px` |
| `--medium-spacing`  | `32px` |
| `--section-spacing` | `48px` |
| `--large-spacing`   | `56px` |
| `--footer-margin`   | `50px` |

`main.css` sets `--footer-margin` again on `.newsletter-pre-footer`, not on `:root`: `var(--section-spacing)` for `body.home` at `min-width: 45em`; `var(--default-spacing)` for `body.single-post` under `max-width: 44.99em`; `var(--default-spacing)` and, in a later rule, `40px` for `body.category` and `body.page-template-template-post-archive`; `100px` for `body.page-template-template-newsletters` at `min-width: 61.25em`.

Page inset used by the splash, footer, and article header: `24px` at `max-width: 61.24em`, `36px` from `61.25em` to `63.99em`, `60px` from `64em`.

## Breakpoints

Named lengths on `:root` in the home critical CSS:

| Token         | From     | Until    |
| ------------- | -------- | -------- |
| `xxs`         | `400px`  | `399px`  |
| `xs`          | `460px`  | `459px`  |
| `s`           | `660px`  | `659px`  |
| `m`           | `720px`  | `719px`  |
| `l`           | `980px`  | `979px`  |
| `xl`          | `1024px` | `1023px` |
| `xxl` / `max` | `1440px` | `1439px` |
| `xxxl`        | `1800px` | `1799px` |

`@media` widths that appear in the home critical CSS or `main.css`. Each value is listed once. Both `min-width` and `max-width` are marked when both occur.

| Value       | Written as  |
| ----------- | ----------- |
| `28.74em`   | `max-width` |
| `28.75em`   | `min-width` |
| `34.9375em` | `max-width` |
| `35em`      | `min-width` |
| `41.25em`   | `min-width` |
| `44.99em`   | `max-width` |
| `45em`      | `min-width` |
| `61.24em`   | `max-width` |
| `61.25em`   | `min-width` |
| `63.99em`   | `max-width` |
| `64em`      | `min-width` |
| `77.5em`    | `min-width` |
| `89.99em`   | `max-width` |
| `90em`      | `min-width` |

## Type

`body` in the home critical CSS: `font-size: 1rem`, `line-height: 1.375`, `font-family: Söhne, "sans-serif"`, `font-weight: 300`.

Element headings in that same style block: `h1, h2` are `1.5625rem` under `max-width: 44.99em` and `1.875rem` under `min-width: 45em`. `h3` is `1.4em`, `h4` is `1em`, `h5` is `.83em`, `h6` is `.67em`.

Component sizes are in the component sections. `border-radius` on the listed components is not present. The only `border-radius` declarations in `main.css` outside WordPress blocks are `.toc__item-sub-items:before` (`3px`) and `.filter-toolbar .toolbar-select__item-checkbox` (`50%`). The only `box-shadow` outside those presets is `.toc:after` (`0 0 1px 0 var(--color-category)`).

## Grid

| Rule                                                           | Declaration                                                                 | Source                                    |
| -------------------------------------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------- |
| `.page-template-template-home .home-contain`                   | `max-width: 1440px`                                                         | home critical CSS                         |
| same, at `min-width: 61.25em`, except `.home-contain--no-grid` | `display: grid; grid-template-columns: repeat(2, 1fr)`                      | home critical CSS                         |
| `.project-list`                                                | `display: grid`; column gap `--default-spacing`; row gap `--medium-spacing` | home critical CSS                         |
| `.project-list` at `min-width: 35em` and `max-width: 61.24em`  | `grid-template-columns: repeat(2, 1fr)`                                     | home critical CSS                         |
| `.project-list--layout-1-col`                                  | `1fr`                                                                       | home critical CSS                         |
| `.project-list--layout-2-col` at `min-width: 61.25em`          | `repeat(2, 1fr)`                                                            | home critical CSS                         |
| `.project-list--layout-3-col` at `min-width: 61.25em`          | `repeat(3, 1fr)`                                                            | home critical CSS                         |
| `.page-template-template-home .home-latest`                    | `max-width: 1440px`; `display: grid`; `column-gap: 20px`                    | `main.css`                                |
| `.single-article`                                              | `max-width: 1440px`                                                         | `main.css`                                |
| `.hero-intro`                                                  | `max-width: 1440px`                                                         | critical CSS in `ref/ifp/html/about.html` |

## Category colour

`--color-category` is not given a palette in `main.css`. The only assignment there is `@media (prefers-contrast: more) { .post-listing { --color-category: #373737 !important } }`. Components otherwise use `var(--color-category, #373737)`.

On `ref/ifp/html/home.html`, each `.spotlight-category` sets the variable inline:

| Inline value         | `.spotlight-category__title` text |
| -------------------- | --------------------------------- |
| `#ff6565`            | Metascience                       |
| `rgba(51,104,206,1)` | High-Skilled Immigration          |
| `#39d794`            | Biotechnology                     |
| `#bd4578`            | Infrastructure                    |
| `#41c4fc`            | Emerging Technology               |

The same hex values are repeated on `post-listing` inline styles in `home.html`, `latest-publications.html`, `category-metascience.html`, `the-launch-sequence.html`, and `transit-abundance-playbook.html`. `#ff6565` also appears in unrelated rules (an image-dialog stroke in the home critical CSS, and a filter-toolbar border in `main.css`). Those rules are not the category variable.

`ref/ifp/html/article-how-the-permitting-deal-works.html` sets `--color-category: #bd4578` and `--color-category-rgb: 189, 69, 120` on `.single-article`.

The home splash sets `--color-hero-background:#b17ada` inline. The splash `:before` uses `background-color: var(--color-hero-background, #B17ADA)`.

## Components

### `post-listing`

Home critical CSS: `.post-listing` is `display: grid` with `border: 1px solid #373737`.

`.post-listing__category` background is `var(--color-category, #373737)` and its text colour is `var(--color-body-background, #FFFEF2)`. `.post-listing__category-name` is Söhne, `.875rem`, `line-height: 1.3`, `font-weight: 900`, `text-transform: uppercase`. Letter-spacing is `.84px` under `max-width: 44.99em` and `.56px` under `min-width: 45em`.

`.post-listing__title` is Tiempos Text, weight 400. Title size is `1.25rem` under `max-width: 44.99em` and `1.375rem` under `min-width: 45em`. Excerpt is Söhne, weight 300, `.8125rem` under `max-width: 44.99em` and `.9375rem` under `min-width: 45em`. Meta colour is `#999`.

`main.css`: `.post-listing:not(.post-listing--featured)` repeats `border: 1px solid #373737`, uses areas `"image" "content"`, and gives `.post-listing__content` `padding: 20px` and `border-top: 1px solid #373737`. No `border-radius` and no `box-shadow` on this component.

### `home-splash`

In `ref/ifp/html/home.html` the element is `<div class="home-splash" style='--color-hero-background:#b17ada'>`, inside `.home-contain.home-contain--splash`.

Home critical CSS: `.home-splash` is a grid with areas `"title"` and `"links"`, `row-gap: 20px`, `color: #fffef2`, `position: relative`. The `:before` is a full-viewport band (`width: 100vw`) using the hero background variable. `.home-splash__video-wrap` covers the grid (`grid-row: 1 / -1`, `grid-column: 1 / -1`) and the video is `position: absolute`.

`.home-splash__title` is Söhne, weight 900, `text-transform: uppercase`, `max-width: 915px`. Font size in source order:

- `max-width: 44.99em`: `2rem`, `line-height: 1`, `letter-spacing: .64px`
- first `min-width: 45em` rule: `2.5rem`, `line-height: .9`, `letter-spacing: 1.6px`
- later `min-width: 45em` rule, same selector: `3.5rem`, `line-height: 1`, `letter-spacing: 2.24px`

Horizontal padding on `.home-splash` is the 24 / 36 / 60px inset above. Bottom padding is `60px` under `max-width: 61.24em` and under `min-width: 64em`.

### Spotlight

Markup classes in `home.html`: `.home-contain.home-contain--spotlight`, `.home-spotlight.home-spotlight-intro`, `.home-spotlight.home-spotlight-posts`.

Sticky is present. `main.css`: `.page-template-template-home .home-spotlight-intro { top: 70px; align-self: start; position: sticky }`.

The two-column frame is the home contain rule: at `min-width: 61.25em`, `.home-contain` is `repeat(2, 1fr)`. Under `max-width: 61.24em`, the home critical CSS sets `.home-contain--spotlight` to `display: flex; flex-direction: column`. At `min-width: 61.25em`, `main.css` adds `border-bottom: 1px solid #373737` on `.home-contain--spotlight`.

`.home-spotlight-intro__title` is `color: #fffef2` with `padding-top: 72px`. Its `:before` is a full-viewport band, `background-color: #ff9762` (`main.css`). `.home-spotlight-posts__title` is `color: #ff9762`.

Each `.spotlight-category` is a grid: `72px 1fr`, areas `"icon title" "icon body"`, `column-gap: 14px`, `row-gap: 4px`. The list has `border-top: 1px solid #FF9762`. The title is Söhne, `.875rem`, weight 900, uppercase. The icon is `.spotlight-category__icon` and, in `home.html`, an inline `<svg>`.

### `project`

Home critical CSS: `.project` sets `--color-accent: #373737` and `border: 1px solid #373737`. `.project__image` background is `var(--color-accent, #373737)`. `.project:hover .project__image` sets `background-color: var(--color-accent)`.

`home.html` uses `class="project project--column"` and `project__image project__image--type-icon` with an inline `<svg>` inside the image slot. `.project__image--type-icon` is `position: relative`; its `:before` is `padding-top: 55.4761904762%`; the `img, svg` are `position: absolute; top: 50%; max-width: 78%`. `.project--column .project__image` has `border-bottom: 1px solid #373737`.

`.project__body` padding is `--small-spacing`. Title is Tiempos Text, weight 400, `1.25rem` under `max-width: 44.99em` and `1.375rem` under `min-width: 45em`. Description is Söhne, weight 300. Links are Söhne, `color: #ff9762`.

There is no `border-radius` on `.project`. The icon is the inline SVG in the saved HTML, not a CSS shape.

### `simple-swiper`

`main.css`:

- `.simple-swiper__items { display: flex }`
- `.simple-swiper__item { flex-grow: 0; flex-shrink: 0 }`
- `.simple-swiper:not(.simple-swiper-initialized) { visibility: hidden }`, and non-first items inside that state are `display: none`

Buttons: `.home-latest__swiper-controller .simple-swiper-controller__button` is `display: flex`, `width: 40px`, `border: 1px solid #373737`. The left button has `margin-right: 10px`. The controller is `display: none` under `max-width: 44.99em`.

Spotlight list under `max-width: 61.24em`: post cards are `flex: 0 0 90%` below `45em` and `flex: 0 0 45%` from `45em` to `61.24em`, with `margin-right: 20px`. At `min-width: 61.25em` the spotlight `.simple-swiper__items` become `flex-direction: column` and `transform: none !important`.

Latest-list cards at `min-width: 45em` have `margin-right: var(--default-spacing)`. Flex basis is `calc(40% - 10px)` from `45em` to `63.99em`, and `calc(33.33% - 13.3333333333px)` from `64em`.

### `site-footer`

`main.css`. Colour `#fffef2`. Söhne, weight 300. `display: grid`. `margin-top: 30px`, unless it follows `.newsletter-pre-footer` (`margin-top: 0`). The `:before` is a full-viewport band, `background-color: #373737`.

At `min-width: 61.25em`: columns `auto 1fr 177px`, areas `"logo main-menu social" "address main-menu copyright" "address main-menu mini-menu"`, `column-gap: 40px`, `row-gap: 8px`, padding `40px` vertical. Logo width `38px`.

At `max-width: 61.24em`: columns `auto 1fr`, areas `"logo social" "address copyright" "address mini-menu"`, gaps `10px`. `.site-footer__main-menu` is `display: none`. Logo width `20px`.

Top-level footer links: `.6875rem`, weight 900, uppercase, `letter-spacing: .44px`. Footer font size is `.6875rem` under `max-width: 44.99em` and `.8125rem` under `min-width: 45em`.

Horizontal padding uses the 24 / 36 / 60px inset.

### `hero-intro`

From the critical CSS in `ref/ifp/html/about.html`, also present for the projects page. `.hero-intro` is `max-width: 1440px`, `display: grid`, `align-content: end`, `column-gap: 60px`, `color: #fffef2`, `padding-top: 130px`, `padding-bottom: 40px`, `margin-bottom: 30px`. Title is Tiempos Text: `2.5rem` / `line-height: 1.15` under `max-width: 44.99em`, and `3.75rem` / `line-height: 1.2` under `min-width: 45em`.

`main.css` `.hero-intro:after` is a full-viewport blend image, `opacity: .25`, `background-image: url(../images/hero-intro-blend-1.webp)`. On `.page-template-template-newsletters .hero-intro:before`, background is `var(--color-accent, #373737)`. `ref/ifp/html/projects.html` has body class `page-template-template-newsletters`.

### `person-card`

`main.css`. `.person-card` grid is `50fr 32fr 18fr` with areas `"image link contacts" "name name name" "title title title"`. Inside `.people-group-list .people-group__list`, `:after` draws `border: 1px solid #373737`, and the image has the same border. Image background on `.person-card__image` is `#b17ada`, with a square `:before` (`padding-top: 100%`). Name is Tiempos Text, weight 400. Title is Söhne, weight 300.

`ref/ifp/html/about.html` contains `.person-card`. Team is not a separate URL; the saved about page is the template that holds these cards.

### `single-article`

`main.css`, and the critical CSS in `ref/ifp/html/article-how-the-permitting-deal-works.html`.

`.single-article` is `max-width: 1440px`. Header colour is `#fffef2`. `.single-article__header-title` is `max-width: 880px`. `.single-article__header-title-primary` is Tiempos Text, weight 400. Body copy (`.article__content`) is Tiempos Text, weight 400. `h1` and `h2` inside the content use `color: var(--color-category)` and weight 500.

At `min-width: 61.25em`, `.single-article .article__toc .toc__list` is `position: sticky` with `top: 70px`.

The saved article sets the category variable inline, as listed above. No `border-radius` on `.single-article`.

### Terminology search

The home search field is a title preview: nothing is listed until there is a query, and the list stops at 12 titles. The terminology page uses the same field over every stored term. Source chips reuse the category-filter border: `1px solid`, `border-line` for the rest and `border-primary` with `text-primary` for the current chip, no radius. A result is a `post-listing` card with no link. The stored English title is the card title and the Persian text is the excerpt.

### Three-cell bar

The home bar is a `1px solid` `border-line` grid with no radius. A cell may be a link. The link adds no extra chrome.

### Contact

`/contact` uses `hero-intro`. The stored address lines sit under it, in the page inset. The IFP contact hero also shows an email and a telephone. The archive page is empty and stores neither, so they are not shown.
