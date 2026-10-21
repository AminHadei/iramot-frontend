# IRAMOT inventory

Pulled from `https://iramot.ir/wp-json/wp/v2` with TLS verification disabled. Placeholder pages already in `content/` were left unchanged.

## Kept

| Type            | File                         | Count |
| --------------- | ---------------------------- | ----- |
| `posts`         | `content/posts.json`         | 604   |
| `pages`         | `content/pages.json`         | 26    |
| `categories`    | `content/categories.json`    | 30    |
| `tags`          | `content/tags.json`          | 119   |
| `events`        | `content/events.json`        | 10    |
| `word_choosing` | `content/word-choosing.json` | 586   |
| `media`         | `content/media.json`         | 1901  |

## Pages

| ID    | Slug                               | Title                            |
| ----- | ---------------------------------- | -------------------------------- |
| 7     | `شرایط-و-قوانین`                   | شرایط و قوانین                   |
| 31    | `cart`                             | سبد خرید                         |
| 32    | `checkout`                         | پرداخت                           |
| 33    | `my-account`                       | حساب کاربری من                   |
| 38    | `انجمن-ها`                         | انجمن‌ها                         |
| 1525  | `dashboard-2`                      | داشبرد المنتور                   |
| 1538  | `سیاست-حریم-خصوصی`                 | سیاست حریم خصوصی                 |
| 1649  | `blog`                             | وبلاگ                            |
| 1867  | `sign-up`                          | ثبت‌نام                          |
| 1868  | `فعال-کردن`                        | فعال کردن                        |
| 2544  | `صفحه-اصلی`                        | صفحه اصلی                        |
| 2856  | `contact-us`                       | تماس با ما                       |
| 2885  | `about-us`                         | درباره ما                        |
| 3023  | `committees`                       | کمیته‌ها                         |
| 7022  | `rcp-register-form`                | عضویت                            |
| 7023  | `rcp-welcome`                      | وضعیت عضویت                      |
| 7024  | `rcp-subscription-details`         | Your Membership                  |
| 7025  | `rcp-profile-editor`               | Edit Your Profile                |
| 7026  | `rcp-update-card`                  | Update Billing Card              |
| 7188  | `مدیریت-نوآوری`                    | مدیریت نوآوری                    |
| 7220  | `conference`                       | کنفرانس                          |
| 7343  | `فرصت-های-همکاری`                  | فرصت‌های همکاری                  |
| 10120 | `پرداخت-حق-عضویت`                  | پرداخت حق عضویت                  |
| 10220 | `جایزه-ملی-مدیریت-فناوری-و-نوآوری` | جایزه ملی مدیریت فناوری و نوآوری |
| 10228 | `جایزه-ملی-مدیریت-نوآوری`          | جایزه ملی مدیریت نوآوری          |
| 10488 | `کارگروه-واژه-گزینی`               | کارگروه واژه گزینی               |

## Set aside

- `posts` 1520 `fact-about-blogging-business` — حقیقت در مورد وبلاگ نویسی کسب و کار. matches buddyboss
- `posts` 1517 `fashion-and-beauty-in-summer` — مد و زیبایی در تابستان. matches buddyboss
- `posts` 1513 `10-tips-for-health-food` — 10 نکته برای سلامتی غذا. matches buddyboss
- `pages` 30 `shop` — فروشگاه. shop page; product endpoint returned no products
- `pages` 2 `برگه-نمونه` — برگه نمونه. sample page برگه نمونه
- `product` `product` — products. product endpoint total 0; empty shop was not written to JSON

No page slug or title is a 404 page.

## Other probed collections

These `rest_base` values returned a list and were not written to `content/*.json`.

- `blocks`: 0
- `navigation`: 1
- `e-floating-buttons`: 0
- `product`: 0
- `bp-member-type`: 3
- `rm_content_editor`: 0
- `jet-engine`: 0

## Unavailable REST types

`wp_font_face` is a route template (`font-families/(?P<font_family_id>[\d]+)/font-faces`), not a collection. It was not fetched.

- `menu-items`: HTTP 401
- `templates`: HTTP 401
- `template-parts`: HTTP 401
- `global-styles`: HTTP 404
- `font-families`: HTTP 401
- `elementor_library`: HTTP 401

## Media downloads

The media endpoint reports `X-WP-Total` 1977. Two full fetches with `orderby=id&order=asc` each returned the same 1901 attachments. The items named by the header and absent from both lists were not invented.

Saved files under `public/media/`: 3378.
Failed downloads: 13.

<!-- cspell:disable -->

- `2021/10/راهنمای-موردنگاری-در-حوزه-مدیریت-فناوری-و-نوآوری-نسخه-جایزه-پُل-سوم-1.pdf`: HTTPError: HTTP Error 404: Not Found
- `2021/10/نتایج-نوآوری-باز.mp4`: HTTPError: HTTP Error 404: Not Found
- `2022/12/فرم-وکالت.docx`: HTTPError: HTTP Error 404: Not Found
- `2023/01/اعضای-پیوسته-انجمن-جهت-مجمع-ارسالی-به-وزارت-17-دی-.pdf`: HTTPError: HTTP Error 404: Not Found
- `2023/01/گزارش-بازرس1401-2.pdf`: HTTPError: HTTP Error 404: Not Found
- `2023/01/گزارش-عملکرد-مالی-سال-1400.pdf`: HTTPError: HTTP Error 404: Not Found
- `2023/01/گزارش-عملکرد-هیات-مدیره-هشتم-انجمن1398-1401.pdf`: HTTPError: HTTP Error 404: Not Found
- `2023/08/راهنمای-کاربری-ثبت-نام-1.pdf`: HTTPError: HTTP Error 404: Not Found
- `2023/12/شرح-چالش-سیاستی-دوم-.pdf`: HTTPError: HTTP Error 404: Not Found
- `2023/12/فرمت-تحلیل-سیاستی-.pdf`: HTTPError: HTTP Error 404: Not Found
- `bb_documents/2021/05/BuddyBoss-Brand-Guideline-2019.pdf`: HTTPError: HTTP Error 403: Forbidden
- `bb_videos/2021/08/6d2b5e90c4c40da9569e786cfaa1e0aa.jpg`: HTTPError: HTTP Error 403: Forbidden
- `bb_videos/2021/08/Ad.mp4`: HTTPError: HTTP Error 403: Forbidden

<!-- cspell:enable -->
