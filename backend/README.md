# Destino Backend

Laravel 12 + Filament 3 backend for the Destino car-directory site. Hosts the public REST API at `/api/v1/*`, the Filament admin panel at `/admin`, and serves uploaded images via the public storage disk. The React SPA at the repo root consumes this API.

This is the source-of-truth backend for everything described in [`../Destino_Backend_PRD.md`](../Destino_Backend_PRD.md). Open the PRD before any non-trivial change — it is binding.

## How to run locally

Prereqs: PHP 8.2+, Composer 2.x, SQLite (no install needed; PHP comes with the SQLite driver on most distros).

```sh
composer install
cp .env.example .env          # then edit values; for local dev, set MAIL_MAILER=log and DB_CONNECTION=sqlite
php artisan key:generate
touch database/database.sqlite # only needed if the file doesn't exist yet
php artisan migrate
php artisan serve              # http://127.0.0.1:8000
```

Smoke checks:

- `curl http://127.0.0.1:8000/api/v1/health` → `{"status":"ok","time":"..."}`
- Visit `http://127.0.0.1:8000/admin` → log in with the super-admin created at install time.

To create a super-admin from scratch:

```sh
php artisan make:filament-user --name="Your Name" --email="you@example.com" --password="<a-strong-password>"
php artisan shield:super-admin --user=<id-printed-above>
```

Run tests:

```sh
vendor/bin/pest
```

## Tech stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Laravel 12 | PRD §4 specified Laravel 11; Laravel 12 confirmed by user 2026-05-09 |
| Admin panel | Filament 3 | Mounted at `/admin` |
| Permissions | Filament Shield + Spatie Permission | `super_admin` role bypasses checks |
| Image processing | Intervention Image v3 | For thumbnail generation in later stages |
| API auth (installed, not wired) | Laravel Sanctum | Reserved for admin-protected endpoints if needed |
| DB (local) | SQLite | `database/database.sqlite` |
| DB (prod) | MySQL 8 | Hostinger-managed |
| Cache | File driver | Upgrade path to Redis is open but not required |
| Queue | Database driver | Used for inquiry email dispatch in Stage 4 |
| Mail (local) | `log` driver | Writes to `storage/logs/laravel.log` |
| Mail (prod) | SMTP via Hostinger | Provider can be swapped via env without code changes |
| Tests | Pest 3 | PHPUnit 11 also available; Pest preferred per PRD §6.5 |

## Environment

`.env.example` is the production template; copy it to `.env` and override for local. Notable variables:

- `APP_TIMEZONE=Asia/Tokyo`, `APP_LOCALE=en` — required, baked into all timestamps and date formatting.
- `FRONTEND_URL` — origin that CORS lets through on `/api/*`. Default `http://localhost:3000` in dev, `https://destinocojp.com` in prod.
- `MAIL_INQUIRY_TO=export@destino.jp` — inquiry destination.
- `EXCHANGE_RATE_API_KEY`, `ONE_PRICE_STOCK_API_*` — replace `CHANGE_ME_*` placeholders before exercising those integrations (Stage 4).

`.env` is gitignored. Never commit it.

## Project layout (Stage 1)

```
app/
  Http/Controllers/Api/V1/HealthController.php   single closure-style controller for /api/v1/health
  Models/User.php                                 + HasRoles trait for Shield
  Providers/Filament/AdminPanelProvider.php       Filament panel registration (with Shield plugin)
config/
  app.php         timezone reads from env
  cors.php        paths=['api/*'], origins=[FRONTEND_URL]
  permission.php  Spatie permission config
routes/
  api.php         /v1 prefix; only /health exists in Stage 1
  web.php         default
tests/
  Pest.php
  Feature/Api/V1/HealthTest.php
```

Models, migrations, Filament resources, REST endpoints beyond `/health`, and the One-Price-Stock integration arrive in Stages 2–4. See the PRD.

## Stage status

| Stage | State |
|---|---|
| 1 — Foundation | done (this repo) |
| 2 — Data layer & admin | not started |
| 3 — Public REST API | not started |
| 4 — Integrations & pipelines | not started |
| 5 — Frontend wiring & deploy | not started |

Open blockers: see [`BLOCKERS.md`](BLOCKERS.md).
