# Fixora — quick start

## Run everything

From this folder:

```bash
npm run dev
```

Or from your home folder (`C:\Users\HP`), the same command works — it now delegates here:

```bash
npm run dev
```

This starts three labelled processes:

| Process | What | URL |
|---|---|---|
| `web` | React app (Vite) | http://localhost:5180 |
| `api` | Laravel API (`php artisan serve`) | http://127.0.0.1:8123 |
| `assets` | Laravel CSS/JS asset watcher | http://localhost:5181 |

These ports are intentionally non-default so they do not clash with browser-automation tools (Makoto).

Press `Ctrl+C` to stop all of them.

## One-time setup

```bash
npm run setup                 # installs root, frontend and backend npm packages
cd backend/api
composer install              # needs PHP 8.3+; PHP 8.5 is installed at C:\Users\HP\.config\herd-lite\bin\php.exe
php artisan key:generate
php artisan migrate --force --seed
```

`backend/api/.env` and the SQLite database are already prepared in this checkout.
The dev script points at the installed PHP 8.5 explicitly, so it works even before you restart the terminal.
(Restarting the terminal puts that PHP on `PATH` for normal `php`/`composer` commands.)

## Notes

- The frontend `npm run dev` lives in `frontend/`.
- The Laravel app lives in `backend/api/`; `backend/package.json` is a thin wrapper around it.
- Demo logins: `user@fixora.edu / user123`, `admin@fixora.edu / admin123`, `rafael@fixora.edu / team123`.
