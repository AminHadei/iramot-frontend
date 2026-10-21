# IRAMOT to IFP mapping

Decision table for the static site. Templates are the measured IFP templates in [ifp-sitemap.md](ifp-sitemap.md). Data is the kept archive in [iramot-inventory.md](iramot-inventory.md). This file does not copy either inventory.

The English route is the only public path. The Persian name is the label. The WordPress slug stays in the data-source cell. An empty body is stated. IFP copy is not used to fill an empty IRAMOT field.

## Shared

IFP template, IRAMOT data.

| Persian name    | Route                       | Template                                   | Data source                                                                                                                                            |
| --------------- | --------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| خانه            | `/`                         | `template-home` (`home-splash`, spotlight) | Page `2544` `صفحه-اصلی` (empty body). Recent items from `content/posts.json`.                                                                          |
| انتشارات        | `/research`                 | `template-post-archive` (`post-listing`)   | Posts in `articles` (مقالات), `news` (اخبار), and the other `اخبار-*` categories. Page `1649` `blog` has an empty body, and there is no blog category. |
| تک‌نوشته        | `/research/[slug]`          | `single-post` (`single-article`)           | One post in `content/posts.json`.                                                                                                                      |
| دسته            | `/research/category/[slug]` | `archive category`                         | The publication categories above in `content/categories.json`. The five IFP topic files are not filters on this list.                                  |
| درباره          | `/about`                    | `template-about`                           | Page `2885` `about-us` (empty body). Mission and history are sections of this page, not separate pages.                                                |
| هیئت‌مدیره      | `/about#team`               | `person-card`                              | Tag `هیئت مدیره` in `content/tags.json`, plus election posts in `content/posts.json`. There is no people collection. Do not invent a roster.           |
| حریم خصوصی      | `/privacy`                  | `privacy-policy`                           | Page `1538` `سیاست-حریم-خصوصی`, which has a body.                                                                                                      |
| فرصت‌های همکاری | `/opportunities`            | `template-opportunities`                   | Page `7343` `فرصت-های-همکاری` (empty body), and categories `آگهی-استخدام`, `استخدام`, `فرصت-های-شغلی`.                                                 |

## IRAMOT only

Built with an IFP template. IFP has no events, terminology, conference, or award template, so the closest measured template is named.

| Persian name   | Route               | Template                           | Data source                                                                                                                                               |
| -------------- | ------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| واژه‌گزینی     | `/terminology`      | `post-listing` with a search field | `content/word-choosing.json` (586 terms; the title is the term). Page `10488` `کارگروه-واژه-گزینی` describes the working group and is not the term list.  |
| کارگروه‌ها     | `/workgroups`       | `template-post-archive`            | Category `workgroups` (کارگروه ها). Page `3023` `committees` has an empty body. The terminology group stays on `/terminology`.                            |
| رویدادها       | `/events`           | `archive category`                 | `content/events.json` (10 items) and the four category filters below.                                                                                     |
| کارگاه         | `/events/workshops` | `archive category`                 | Post category `کارگاه`.                                                                                                                                   |
| کتاب‌خوانی     | `/events/reading`   | `archive category`                 | Post category `رویداد-3` (کتابخوانی), plus matching items in `content/events.json`.                                                                       |
| سفر رساله      | `/events/thesis`    | `archive category`                 | Post category `رویداد-2` (سفر رساله), plus matching items in `content/events.json`.                                                                       |
| نقد فیلم       | `/events/film`      | `archive category`                 | Post category `رویداد` (نقد فیلم), plus matching items in `content/events.json`.                                                                          |
| کنفرانس سالانه | `/conference`       | `template-post-archive`            | Page `7220` `conference` (empty body). Categories `کنفرانس-مدیریت-فناوری-و-نواوری` and `conference-news`.                                                 |
| جایزه ملی      | `/award`            | `template-post-archive`            | Page `10220` `جایزه-ملی-مدیریت-فناوری-و-نوآوری` (has a body) and page `10228` `جایزه-ملی-مدیریت-نوآوری` (empty body). Category `جایزه-ملی-مدیریت-نوآوری`. |
| فصلنامه‌ها     | `/quarterlies`      | `post-listing`                     | Categories `quarterly-magazine` (فصلنامه ها) and `فصلنامه-سیاست-علم-و-فناوری`. Outbound links in those posts stay external.                               |
| همراهان انجمن  | `/partners`         | `person-card`                      | No kept collection. Page `38` `انجمن-ها` has an empty body. Do not invent a list.                                                                         |
| عضویت          | `/membership`       | `template-course-general-content`  | Page `7022` `rcp-register-form`, which has the membership rules.                                                                                          |
| اساسنامه       | `/statute`          | document page                      | Media `974`, local file `/media/2019/08/unnamed-file.pdf`. Page `7` `شرایط-و-قوانین` is Cafe LMS boilerplate and is not the statute.                      |
| تماس           | `/contact`          | `template-contact`                 | Page `2856` `contact-us` (empty body).                                                                                                                    |

`fields["word-category"]` on each term is a list of ids, not names. 438 terms are `115` and `116`, 123 are `181`, 22 have none, 2 are only `116`, and 1 is `128`, `116`, and `115`. Those ids are not in `content/categories.json` or `content/tags.json`. Do not label them as the association list or the academy list.

The 10 events are book-reading sessions, a thesis trip, film discussions, one research camp, and one terminology meeting.

## IFP only

Keep the current IFP placeholder content. `placeholder: true` stays. Do not fill these from the IRAMOT archive. Routes already in the app stay. Routes that exist only on IFP are recorded here and are not created by this document.

| Persian name   | Route                                                                                                                | Template                                                                                         | Data source                                                                                                                                                                                         |
| -------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| موضوع‌های IFP  | `/research`                                                                                                          | `archive category`                                                                               | `content/areas/01.science.yml`, `02.industry.yml`, `03.market.yml`, `04.talent.yml`, `05.emerging.yml`. Each file links to `/research` and has `placeholder: true`. They are not IRAMOT categories. |
| مقاله‌های موقت | `/research/[slug]`                                                                                                   | `single-post`                                                                                    | `content/research/*.md`, all `placeholder: true`. They stay until a later change points `/research` at `content/posts.json`. This document does not change that route.                              |
| پروژه‌ها       | `/projects`, `/projects/[slug]`                                                                                      | `template-newsletters` (`project`)                                                               | `content/projects/*.md`, all `placeholder: true`.                                                                                                                                                   |
| فهرست مطالعه   | `/the-launch-sequence`, `/transit-abundance-playbook`                                                                | `template-reading-list`                                                                          | IFP pages only. Not in the app yet.                                                                                                                                                                 |
| دوره‌ها        | `/economics-of-ideas`, `/economics-of-ideas/syllabus`, `/economics-of-ideas/apply`, `/independent-filmmaker-project` | `template-course-landing`, `template-course-longform-content`, `template-course-general-content` | IFP pages only. Not in the app yet.                                                                                                                                                                 |
| آگهی‌های IFP   | do not add to `/opportunities`                                                                                       | `single-opportunities`                                                                           | The two IFP job singles. They stay IFP placeholders.                                                                                                                                                |

## Excluded

Not public routes: the sample page `برگه نمونه`, the empty shop, the three buddyboss demo posts, cart, checkout, account, the elementor dashboard, and the empty membership-card pages. Author URLs were not fetched. `locations.kml` is not a page.
