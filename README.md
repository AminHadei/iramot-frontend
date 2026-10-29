# irmot

Site for the Iran Technology and Innovation Management Association. Nuxt 4, server-rendered, Persian, RTL. Public pages read a content API on each request.

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build        # .output/server
pnpm start        # node .output/server/index.mjs
pnpm check        # typecheck, lint, format, spellcheck
pnpm test         # unit tests
pnpm changeset    # changelog entry for a user-visible change
```

```bash
NUXT_PUBLIC_API_BASE=http://localhost:4000 pnpm dev
```

`NUXT_API_BASE_INTERNAL` is the origin the server uses. When it is empty, the server uses `NUXT_PUBLIC_API_BASE`. Account and admin routes stay client-rendered. See [docs/deployment.md](docs/deployment.md) and [docs/membership.md](docs/membership.md).

Images are served by the backend. Relative upload paths are resolved against `NUXT_PUBLIC_API_BASE`. To import the existing files, run the backend `import:content` against a checkout of frontend `main`, which still contains `public/media`.

Agent orientation: `AGENTS.md`.
