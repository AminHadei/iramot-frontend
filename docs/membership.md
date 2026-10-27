# Membership panels

The public site stays a static Nuxt generate. Account, admin, and content-management screens are client-rendered routes. They call a separate HTTP API when `NUXT_PUBLIC_API_BASE` is set. With that variable empty, generate and the public pages keep using the JSON repositories.

## Environment

| Variable                            | Role                                                                                               |
| ----------------------------------- | -------------------------------------------------------------------------------------------------- |
| `NUXT_PUBLIC_API_BASE`              | API origin, for example `http://localhost:3001`. Empty keeps JSON content and hides account links. |
| `NUXT_APP_BASE_URL`                 | Site base. Production is `/irmot/`.                                                                |
| `NUXT_PUBLIC_<SECTION>_SOURCE`      | `json` or `api`. Empty follows `NUXT_PUBLIC_API_BASE`.                                             |
| `NUXT_PUBLIC_<SECTION>_API_BASE`    | Optional override for that section.                                                                |
| `NUXT_PUBLIC_OPPORTUNITIES_SAMPLES` | `false` drops items flagged `sample`, in JSON and API mode.                                        |

Sections: `news`, `terms`, `events`, `partners`, `opportunities`, `quarterlies`, `workgroups`, `projects`, `areas`, `research`, `guides`, `pages`, `site`, `home`, `about`, `conference`, `award`.

## Local API

```bash
# API process from the backend repository, then:
NUXT_PUBLIC_API_BASE=http://localhost:3001 pnpm dev
```

Generate still succeeds without the variable. Setting the variable also switches public sections to the API at prerender time. To keep public pages on the JSON files while account screens call the API, set `NUXT_PUBLIC_<SECTION>_SOURCE=json` for each section. If a content request fails while prerendering, that read falls back to the JSON files so the static build can finish. A successful API response, including an empty list, is used as returned. Account routes stay `ssr: false` and do not call the API during generate.

GitHub Pages deep links use `404.html`, copied from the login shell after `nuxt generate`, so a refresh under `/irmot/` still boots the client router.

## Routes

| Path                                                                                            | Who                                       |
| ----------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `/auth/login`, `/auth/register`, `/auth/forgot`                                                 | guests                                    |
| `/panel`, `/panel/profile`, `/panel/password`                                                   | signed-in users                           |
| `/panel/membership`, `/panel/membership/apply`, `/panel/membership/return`, `/payment/callback` | membership and mock-gateway return        |
| `/panel/applications`, `/panel/applications/:id`                                                | status, rejection reason, resubmit        |
| `/panel/payments`, `/panel/card`                                                                | payments and PNG card                     |
| `/admin`                                                                                        | stats and publish (`POST /admin/rebuild`) |
| `/admin/applications`, `/admin/applications/:id`                                                | approval queue                            |
| `/admin/memberships`, `/admin/payments`                                                         | filtered lists                            |
| `/admin/plans`, `/admin/plans/new`, `/admin/plans/:id`                                          | plan CRUD                                 |
| `/admin/discounts`, `/admin/discounts/new`, `/admin/discounts/:id`                              | discount CRUD                             |
| `/admin/users`, `/admin/users/:id`                                                              | search, role, active flag                 |
| `/admin/content`, `/admin/content/:type`, `/admin/content/:type/:id`                            | content editor                            |

Persian interface copy is `content/panel.yml`.

## Token storage

The access token stays in memory. The refresh token is in `sessionStorage` under `irmot.refreshToken`. A 401 triggers one shared refresh (`POST /auth/refresh` with `{ refreshToken }`). If that fails, the session is cleared.

`sessionStorage` is the least-exposed option for a static site on another origin when the API returns the refresh token in JSON: it is not sent to the GitHub Pages host, and it ends when the tab closes. It is still readable by any script on the page. An `httpOnly` `Secure` cookie would be stronger and is not implemented here, because it needs API changes: `Set-Cookie` on login and refresh, `Access-Control-Allow-Credentials`, an explicit CORS origin, `SameSite=None` for the Pages host, and CSRF protection. The browser client would then call refresh with `credentials: "include"` and stop storing the refresh token.

## API contract

Prices are integer toman. The interface formats them with Persian digits and a thousands separator, and labels the unit "toman" in Persian script.

Auth: `POST /auth/register`, `/auth/login`, `/auth/refresh` with `{ refreshToken }`, `POST /auth/logout` with the access token and `{ refreshToken }`, `POST /auth/forgot-password` with `{ mobile }`, `POST /auth/reset-password` with `{ mobile, otp, newPassword }`, `POST /auth/change-password` with `{ currentPassword, newPassword }`. Profile is `GET` and `PUT /users/me`. The profile form sends `email` only. `firstName`, `lastName`, and `mobile` are shown read-only and are changed by an admin. Login JSON is `{ accessToken, refreshToken, user }`. Refresh returns tokens. A password change clears the local session.

Users admin: `GET /users` returns `{ users, total, page, limit, totalPages }` and accepts `search`, `role`, `page`, and `limit`. `GET /users/:id`. `PUT /users/:id` with `{ firstName?, lastName?, mobile?, email? }` updates identity. A duplicate mobile returns 409. `PATCH /users/:id/role` with `{ role }`. `PATCH /users/:id/status` with `{ isActive }`.

Plans: public `GET /membership-plans` returns `{ plans, total, page, limit, totalPages }`. `GET /membership-plans/:id` returns one plan. Admin create, update, and delete use the same paths (`POST`, `PUT`, `DELETE`). Fields are `title`, `category`, `personType`, `durationMonths`, `price`, `benefits`, `description`, `requiredDocuments`, `isActive`, and `sortOrder`. `personType` is `natural` or `legal`.

Discounts: admin CRUD is `/discount-codes`. The list is `{ codes, total, page, limit, totalPages }`. Validate is `POST /discount-codes/validate` with `{ code, planId, originalPrice }` and returns `{ valid, discountCodeId, discountAmount, finalPrice, message }`. A code is `percent` or `fixed`, with `value`, optional `maxDiscount`, `validFrom`, `validUntil`, `totalUsageLimit`, `perUserLimit`, `allowedPlans`, and `isActive`.

Applications: `POST /membership-applications` with `{ planId }` creates a draft. `PUT /membership-applications/:id` updates a draft or a rejected application. Document upload is `POST /membership-applications/:id/upload/:documentType` with multipart field `file`. Download is `GET /membership-applications/:id/documents/:documentType`. Document types are `personnel_photo`, `latest_degree`, `student_card`, `resume`, and `company_logo`. `POST /membership-applications/:id/submit` moves the draft to payment. Lists are `GET /membership-applications/my`, `GET /membership-applications/my/membership`, and `GET /membership-applications/my/active-membership`. Statuses are `draft`, `pending_payment`, `pending_review`, `approved`, and `rejected`. An approved application also has `membershipState` of `active` or `expired`. Natural fields include `educationStatus`, `fieldOfStudy`, `firstName`, `lastName`, `phone`, `nationalCode`, `fatherName`, `birthDate`, `email`, `university`, `address`, and `postalCode`. Legal fields include `companyName`, `fieldOfActivity`, `companyPhone`, `nationalId`, `ceoFullName`, `representativeName`, `representativePosition`, and `representativePhone`.

Payments: `POST /payments` with `{ applicationId, discountCode? }` returns `{ paymentId, redirectUrl, authority }`. The client stores `paymentId` in `sessionStorage` under `irmot.pendingPayment` and follows `redirectUrl`. The mock gateway sends the browser to `/payment/callback` with `paymentId`, `authority`, and `status` (`OK` or `NOK`). That page calls `POST /payments/:id/verify?authority=&status=`. `/panel/membership/return` verifies the same query. History is `GET /payments/my`. Admin payment lists are `{ payments, total, page, limit, totalPages }`. Statuses are `pending`, `success`, `failed`, and `cancelled`. Amounts are `amount`, `discountAmount`, and `finalAmount`.

The membership card is `GET /membership-card/:applicationId` and returns a PNG for an approved application owned by the caller or an admin.

Admin membership: `GET /admin/membership/queue` and `GET /admin/membership/applications` return `{ applications, total, page, limit, totalPages }`. `GET /admin/membership/applications` (`status`, `planId`, `page`, `limit`; `expired` selects approved memberships past their expiry), `GET /admin/membership/payments`, and `GET /admin/membership/stats` (`applicationsByStatus`, `revenue`, `successfulPayments`). Approve is `POST /membership-applications/:id/approve` with optional `{ membershipNumber }`. Reject is `POST /membership-applications/:id/reject` with `{ reason }`. The queue shows each plan's `title` from `GET /membership-plans`.

Content admin types are singular: `news`, `news-category`, `news-tag`, `event`, `opportunity`, `quarterly`, `partner`, `workgroup`, `term`, `term-source`, `project`, `area`, `research`, `guide`, and `page`. Create sends `{ slug, publicId?, status?, publishedAt?, sortOrder?, seo?, payload }`. Update is `PUT /admin/content/:type/:id`. Also `POST /admin/content/:type/bulk-delete` and `PUT /admin/content/:type/reorder`. Singletons are `GET` and `PUT` on `/admin/settings`, `/admin/home`, `/admin/about`, `/admin/conference`, `/admin/award`, and `/admin/workgroups/section`, with `{ status?, payload }`. Media is `POST /admin/media` (multipart `file` and optional `alt`), `GET /admin/media`, and `DELETE /admin/media/:id`. Public files are `GET /media/files/:name`. Rebuild is `GET` and `POST /admin/rebuild`. `POST` returns `{ enabled, triggered }` and stays successful when the GitHub hook is unset.

Public content reads: `/news`, `/news/:slug`, `/news/categories`, `/events`, `/events/featured`, `/events/:slug`, `/opportunities`, `/partners`, `/quarterlies`, `/terms`, `/terms/sources`, `/workgroups`, `/workgroups/:slug`, `/projects`, `/projects/:slug`, `/areas`, `/research`, `/research/:slug`, `/guides`, `/guides/:key`, `/pages`, `/pages/:slug`, `/pages/by-id/:publicId`, `/site`, `/home`, `/about`, `/conference`, `/award`.

`GET` by slug returns 404 for a missing record and the client treats that as null. `GET /events/featured` may return JSON `null`. The opportunities response includes published samples; the client drops `sample: true` when `NUXT_PUBLIC_OPPORTUNITIES_SAMPLES` is false.

File fields that are absolute URLs are used as returned. Paths under `/uploads`, `/storage`, `/files`, or `/media/files` are joined to the API origin. Other site files such as `/media/news/...` are prefixed with the site base URL.
