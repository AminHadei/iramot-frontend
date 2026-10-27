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

Generate still succeeds without the variable. Setting the variable also switches public sections to the API at prerender time. If a content request fails while prerendering, that read falls back to the JSON files so the static build can finish. A successful API response, including an empty list, is used as returned. Account routes stay `ssr: false` and do not call the API during generate.

GitHub Pages deep links use `404.html`, copied from the login shell after `nuxt generate`, so a refresh under `/irmot/` still boots the client router.

## Routes

| Path                                                                       | Who                                       |
| -------------------------------------------------------------------------- | ----------------------------------------- |
| `/auth/login`, `/auth/register`, `/auth/forgot`                            | guests                                    |
| `/panel`, `/panel/profile`, `/panel/password`                              | signed-in users                           |
| `/panel/membership`, `/panel/membership/apply`, `/panel/membership/return` | membership and mock-gateway return        |
| `/panel/applications`, `/panel/applications/:id`                           | status, rejection reason, resubmit        |
| `/panel/payments`, `/panel/card`                                           | payments and PNG card                     |
| `/admin`                                                                   | stats and publish (`POST /admin/rebuild`) |
| `/admin/applications`, `/admin/applications/:id`                           | approval queue                            |
| `/admin/memberships`, `/admin/payments`                                    | filtered lists                            |
| `/admin/plans`, `/admin/plans/new`, `/admin/plans/:id`                     | plan CRUD                                 |
| `/admin/discounts`, `/admin/discounts/new`, `/admin/discounts/:id`         | discount CRUD                             |
| `/admin/users`, `/admin/users/:id`                                         | search, role, active flag                 |
| `/admin/content`, `/admin/content/:type`, `/admin/content/:type/:id`       | content editor                            |

Persian interface copy is `content/panel.yml`.

## Token storage

The access token stays in memory. The refresh token is in `sessionStorage` under `irmot.refreshToken`. A 401 triggers one shared refresh (`POST /auth/refresh` with `{ refreshToken }`). If that fails, the session is cleared.

`sessionStorage` is the least-exposed option for a static site on another origin when the API returns the refresh token in JSON: it is not sent to the GitHub Pages host, and it ends when the tab closes. It is still readable by any script on the page. An `httpOnly` `Secure` cookie would be stronger and is not implemented here, because it needs API changes: `Set-Cookie` on login and refresh, `Access-Control-Allow-Credentials`, an explicit CORS origin, `SameSite=None` for the Pages host, and CSRF protection. The browser client would then call refresh with `credentials: "include"` and stop storing the refresh token.

## API contract

Paths below are what this site calls. Adjust the API if a deployed backend uses different names.

Auth: `POST /auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/change-password`, `GET` and `PATCH /users/me`.

Login and refresh JSON may use `accessToken` or `access_token`, and `refreshToken` or `refresh_token`. The user may be nested as `user`.

Membership: `GET /membership/plans`, `GET /membership/status`, `POST /membership/discount-codes/validate`, `POST /membership/applications`, `POST /membership/applications/:id/documents` (multipart `file` and `key`), `POST /membership/applications/:id/pay` with `{ returnUrl }` returning `{ redirectUrl }`, `GET /membership/applications`, `GET /membership/applications/:id`, `POST /membership/applications/:id/resubmit`, `GET /membership/payments`, `GET /membership/card` (PNG).

The return page reads `status` or `success`, plus optional `paymentId`.

Admin: `GET /admin/stats`, `POST /admin/rebuild`, `GET /admin/applications`, `GET /admin/applications/:id`, `POST /admin/applications/:id/approve`, `POST /admin/applications/:id/reject` with `{ reason }`, `GET /admin/memberships`, `GET /admin/payments`, CRUD `/admin/membership-plans` and `/admin/discount-codes`, `GET /admin/users`, `PATCH /admin/users/:id`, `POST /admin/media`, content collection CRUD `/admin/content/:type` and `/admin/content/:type/:id`, singletons `PUT /admin/settings`, `/admin/home`, `/admin/about`, `/admin/conference`, `/admin/award`, `/admin/workgroups/section`.

Public content reads use the same paths as the existing JSON APIs (`/news`, `/news/:slug`, `/events`, `/events/featured`, `/events/:slug`, `/opportunities`, `/partners`, `/quarterlies`, `/terms`, `/terms/sources`) plus `/workgroups`, `/workgroups/:slug`, `/projects`, `/projects/:slug`, `/areas`, `/research`, `/research/:slug`, `/guides`, `/guides/:key`, `/pages/:id`, `/settings`, `/home`, `/about`, `/conference`, `/award`.

`GET` by id returns 404 for a missing record and the client treats that as null. `GET /events/featured` may return JSON `null`. `GET /opportunities?samples=0` should omit sample rows; the client also drops `sample: true` when `NUXT_PUBLIC_OPPORTUNITIES_SAMPLES` is false.

File fields that are absolute URLs are used as returned. Paths under `/uploads`, `/storage`, or `/files` are joined to the API origin. Other site files such as `/media/...` are prefixed with the site base URL.
