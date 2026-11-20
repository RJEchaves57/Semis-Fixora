# Fixora Laravel backend

REST API for the Fixora School Maintenance System (Laravel 11/12 + Sanctum bearer tokens).
This folder holds only the files that are specific to Fixora (`overlay/`); the setup script creates a
fresh Laravel app and applies them, so you always get a clean, up-to-date framework install.

## Setup (needs PHP 8.2+ and Composer)

```bash
cd backend
./setup.sh          # macOS / Linux / Git Bash
.\setup.ps1         # Windows PowerShell
cd api && php artisan serve      # http://127.0.0.1:8000
```

The default database is SQLite (no server needed). To use MySQL, edit `backend/api/.env` and run `php artisan migrate`.
Demo accounts are seeded (same as the React demo): `user@fixora.edu / user123`, `admin@fixora.edu / admin123`, `rafael@fixora.edu / team123`.
**Change or delete them before going live.**

## Duplicate reports

A new request is rejected with **HTTP 409** when an *open* request (Pending, Approved, Assigned or In Progress)
already describes the same issue: same **category + location + title**, ignoring case, punctuation and extra spaces,
no matter who reported it.

```json
{ "message": "A report for this issue is already open (FX-2049). Please wait for it to be resolved.", "duplicate_of": "FX-2049" }
```

* Once the earlier request is **Declined** or **Resolved**, the same issue can be reported again.
* It is enforced in the database (a UNIQUE index on `open_fingerprint`), so two identical submissions at the same
  instant can't both get in. Uploaded files are cleaned up when a submission is rejected.
* To change what counts as "the same", edit `MaintenanceRequest::fingerprint()` (and `src/lib/duplicates.ts` in the front end).

## Endpoints (`Authorization: Bearer <token>` except register/login)

| Method | Path | Who | Notes |
|---|---|---|---|
| POST | `/api/register` | anyone | `name,email,password,role[,specialty,code]`. Staff roles need the staff code |
| POST | `/api/login` | anyone | `email,password,role` -> `{user, token}` |
| GET | `/api/me` · POST `/api/logout` | signed in | |
| GET | `/api/staff` | admin | maintenance team list |
| GET | `/api/requests` | all | users see their own, maintenance see assigned to them, admin sees all. `?status=` filter |
| GET | `/api/requests/{id}` | owner / assignee / admin | |
| POST | `/api/requests` | user | `multipart/form-data`: `title,description,category,location,priority,images[] (1-6, 5 MB),video (50 MB)` -> 201, or **409 duplicate** |
| POST | `/api/requests/{id}/approve` | admin | Pending -> Approved |
| POST | `/api/requests/{id}/decline` | admin | `reason` required. Pending -> Declined |
| POST | `/api/requests/{id}/assign` | admin | `staff_id`. Approved/Assigned -> Assigned |
| POST | `/api/requests/{id}/start` | assigned maintenance | Assigned -> In Progress |
| POST | `/api/requests/{id}/resolve` | assigned maintenance | In Progress -> Resolved |

`{id}` is the numeric database id. Responses use the same field names as `src/types.ts` (`id` is the `FX-xxxx` code).

PHP's `upload_max_filesize` and `post_max_size` (php.ini) must be at least ~60M for the 50 MB video limit.

## Not done yet

The React app still stores everything in the browser (localStorage), so it does not call this API yet. Moving
`AuthContext` / `RequestsContext` to `fetch` calls against these endpoints is the next step. Until then,
`src/lib/duplicates.ts` applies the same duplicate rule inside the browser.
