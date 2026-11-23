# Fixora — quick start

## Run everything

From this folder:

```bash
npm run dev
```

This starts three labelled processes:

| Process | What | URL |
|---|---|---|
| `web` | React app (Vite) | http://localhost:5180 |
| `api` | Laravel API inside Docker (PHP 8.4 + pdo_pgsql) | http://127.0.0.1:8123 |
| `assets` | Laravel CSS/JS asset watcher | http://localhost:5181 |

The ports are intentionally non-default so they do not clash with browser-automation tools.

`npm run dev` is **duplicate-safe**. If Fixora is already running, it will not start a second copy. It will tell you to open http://localhost:5180 instead.

Press `Ctrl+C` to stop all three processes. The Docker container keeps running so the API stays connected; if it ever stops, the `api` process starts it again automatically.

## Backend database

The backend uses **Neon PostgreSQL**, not SQLite. The connection is stored in:

```text
backend/api/.env
```

It uses the direct Neon host (without `-pooler`) because the pooler breaks PHP transactions.

## One-time setup

```bash
npm run setup
cd backend/api
docker build -t fixora-api:local .
```

Docker Desktop must be running. The first `npm run dev` will build/start the backend container if needed.

## Render deployment

`render.yaml` is included as a blueprint. It creates:

- `fixora-api` — Docker web service using `backend/api/Dockerfile`
- `fixora-web` — static site built from `frontend/`

No Render PostgreSQL add-on is created because Neon is used instead. Secrets are marked `sync: false`, so Render will ask you to fill them in the dashboard:

- `APP_KEY`
- `APP_URL`
- `DB_PASSWORD`
- `FRONTEND_URL`
- `VITE_API_URL`
- `FIXORA_ADMIN_CODE`
- `FIXORA_MAINTENANCE_CODE`

Set `VITE_API_URL` to the Render API service URL, for example:

```text
https://fixora-api.onrender.com
```

## Demo logins

- `user@fixora.edu` / `user123`
- `admin@fixora.edu` / `admin123`
- `rafael@fixora.edu` / `team123`
