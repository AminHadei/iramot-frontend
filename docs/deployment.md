# Deployment

The site is a Nuxt server. Public pages read the content API on each request. Account, admin, and payment routes stay client-rendered.

```bash
pnpm install
pnpm build
node .output/server/index.mjs
```

`GET /healthz` returns `{ "ok": true }`.

## Environment

Copy `.env.example`.

| Variable                  | Role                                                            |
| ------------------------- | --------------------------------------------------------------- |
| `NUXT_PUBLIC_API_BASE`    | API origin the browser calls.                                   |
| `NUXT_API_BASE_INTERNAL`  | API origin the Nuxt server calls. Empty uses the public origin. |
| `HOST`                    | Bind address. `0.0.0.0` in Docker.                              |
| `PORT`                    | Listen port. `3000` in the image.                               |
| `NUXT_TELEMETRY_DISABLED` | Set to `1` so Nuxt does not prompt.                             |

Serve the site at `/`.

## Docker

The image is multi-stage: Node 22, pnpm 10.33.4, a non-root `node` user, and a health check against `/healthz`.

```bash
docker compose up --build -d
```

`docker-compose.yml` runs only this site. Point `NUXT_PUBLIC_API_BASE` and `NUXT_API_BASE_INTERNAL` at the API process.

Legacy files under `/media/...` are not copied into the image. The `main` branch still has `public/media/`. Mount that directory at `.output/public/media` when imported payloads still use those paths and the API has not stored the bytes itself.

## pm2 and Nginx

```bash
pnpm install --frozen-lockfile
pnpm build
pm2 start .output/server/index.mjs --name irmot --update-env
```

Pass the variables from `.env.example` in the pm2 environment. Nginx terminates TLS and proxies to the Node port.

```nginx
server {
    listen 80;
    server_name example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name example.com;

    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    gzip on;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;

    location /_nuxt/ {
        proxy_pass http://127.0.0.1:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Issue the certificate with certbot, then reload Nginx:

```bash
sudo certbot --nginx -d example.com
sudo nginx -t && sudo systemctl reload nginx
```

## Importing the old archive

`main` in this repository still has the former `content/` tree. On the backend host, check out that branch and import once:

```bash
pnpm import:content /path/to/iramot-frontend
```

Run that command from the backend repository. The path is a checkout of this repo's `main` branch. Repeat the import only when you intend to replace the MongoDB documents.
