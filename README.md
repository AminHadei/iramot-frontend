# irmot

Static site for the Iran Technology and Innovation Management Association. Nuxt 4, Persian, RTL.

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm generate     # .output/public
pnpm check        # typecheck, lint, format, spellcheck
pnpm test         # unit tests
pnpm changeset    # changelog entry for a user-visible change
```

Account and admin screens call an HTTP API when `NUXT_PUBLIC_API_BASE` is set. Leave it empty to build and browse the static JSON site. See [docs/membership.md](docs/membership.md).

```bash
NUXT_PUBLIC_API_BASE=http://localhost:3001 pnpm dev
```

Agent orientation: `AGENTS.md`.
