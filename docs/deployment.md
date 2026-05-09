# Destino Hostinger Deployment Runbook

This is the source of truth for deploying the Destino site to Hostinger Cloud Startup. There are two pieces:

| Surface | Deploys to | Holds |
|---|---|---|
| React static build | `destinocojp.com` (apex) | The public site users see |
| Laravel API + Filament admin | `api.destinocojp.com` (subdomain) | The REST API, admin panel, MySQL data, file uploads |

The two pieces are independent — you can redeploy one without touching the other.

---

## First-time deploy

Do these once, in order. Each section is roughly 10–20 minutes.

### A. Domain & SSL setup (hPanel)

1. In hPanel, your primary domain `destinocojp.com` is the React site.
2. **Subdomains** → **Create Subdomain**.
   - Subdomain: `api`
   - Document root: leave default (`public_html/api.destinocojp.com/`).
3. After creation, the subdomain root maps to a folder under your home directory; note the path (something like `/home/<user>/domains/api.destinocojp.com/public_html`).
4. **SSL** → enable Let's Encrypt SSL on **both** domains. Wait 5–10 minutes for issuance to complete.
5. _Screenshot placeholder_: `docs/screenshots/01-hpanel-domains.png` — the domains panel showing both with SSL enabled.

### B. MySQL database

1. **Databases** → **Create Database**.
2. Name: `destino_prod` (or whatever your account allows). Set a strong password.
3. Note `DB_HOST`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` — you'll paste them into `.env` shortly.
4. Whitelist remote access? Not needed; Laravel runs on the same host.
5. _Screenshot placeholder_: `docs/screenshots/02-hpanel-mysql.png` — the new database listed.

### C. Laravel deploy (`api.destinocojp.com`)

The Laravel app lives in `backend/` in the source repo. On Hostinger you can deploy via Git or by uploading a zip — Git is recommended.

1. **Git** → **Create Git Deployment**.
   - Repository: your private GitHub URL.
   - Branch: `main`.
   - Deploy path: the path you noted in step A (the subdomain document root's parent — _not_ `public_html` itself, because Laravel's public folder is `backend/public`).
2. Hostinger pulls the repo. Now SSH in (Advanced → SSH Access).
3. Move the Laravel app into place. Two layouts work; pick one and stick with it:

   **Option 1 (recommended) — symlink Laravel's `public/` to the document root.**
   ```bash
   cd ~/domains/api.destinocojp.com
   # repo is now under ./repo or wherever Hostinger placed it; suppose it's ./destino-backend
   rm -rf public_html
   ln -s ./destino-backend/backend/public public_html
   ```

   **Option 2 — change the document root in hPanel** to point directly at `domains/api.destinocojp.com/destino-backend/backend/public`. Same end result, different button.

4. Install dependencies:
   ```bash
   cd ~/domains/api.destinocojp.com/destino-backend/backend
   composer install --no-dev --optimize-autoloader
   ```
5. Copy and edit `.env`:
   ```bash
   cp .env.example .env
   nano .env
   ```
   Fill in:
   - `APP_KEY` will be generated next.
   - `APP_URL=https://api.destinocojp.com`
   - `APP_DEBUG=false`
   - `DB_*` from step B.
   - `MAIL_*` — see the SMTP section below.
   - `EXCHANGE_RATE_API_KEY` — your exchangerate-api.com key.
   - `FRONTEND_URL=https://destinocojp.com`
   - `MAIL_INQUIRY_TO=export@destino.jp`
   - `ONE_PRICE_STOCK_API_URL` and `_API_KEY` — leave as `CHANGE_ME_*` if not yet supplied; the sync job no-ops gracefully.

6. Generate the app key, run migrations, seed:
   ```bash
   php artisan key:generate
   php artisan migrate --force
   php artisan db:seed --force
   ```
7. Storage symlink + caches:
   ```bash
   php artisan storage:link
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   chmod -R 775 storage bootstrap/cache
   ```
8. Create the first admin user:
   ```bash
   php artisan make:filament-user
   ```
   Answer the prompts (name, email, password). This is your admin login for `https://api.destinocojp.com/admin`.

### D. Cron (Hostinger)

1. **Cron Jobs** → **Create Cron Job**.
2. Schedule: every minute (`* * * * *`).
3. Command:
   ```
   cd /home/<user>/domains/api.destinocojp.com/destino-backend/backend && php artisan schedule:run >> /dev/null 2>&1
   ```
   Replace `<user>` with your Hostinger username (visible in the SSH prompt).
4. _Screenshot placeholder_: `docs/screenshots/03-hpanel-cron.png`.

This single cron drives:
- `stock:sync --hourly` (One-Price Stock import).
- `queue:work --stop-when-empty` every minute (sends inquiry emails).
- Cache cleanup, log rotation.

### E. SMTP (Mail)

You have two options. Pick one and update `.env`:

1. **Hostinger mailbox** — create `noreply@destino.jp` in **Email Accounts**. Use:
   ```
   MAIL_HOST=smtp.hostinger.com
   MAIL_PORT=587
   MAIL_USERNAME=noreply@destino.jp
   MAIL_PASSWORD=<the password you set>
   MAIL_ENCRYPTION=tls
   MAIL_FROM_ADDRESS=noreply@destino.jp
   ```
2. **Third-party** (Postmark / Resend / SES) — paste their SMTP credentials into the same fields.

After editing, clear cache and test:
```bash
php artisan config:clear
php artisan tinker
> Mail::raw('test', fn($m) => $m->to('export@destino.jp')->subject('SMTP test'));
> exit
```
If the email arrives, SMTP is working.

### F. React deploy (`destinocojp.com`)

The React build lives at the repo root.

1. On your local machine:
   ```bash
   npm install
   npm run build
   ```
2. The build output is in `dist/`. Upload **the contents** of `dist/` (not the folder itself) to `~/domains/destinocojp.com/public_html/`. Use the **File Manager** in hPanel or SFTP.

3. Add an `.htaccess` file in `public_html/` for SPA routing:
   ```
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

4. _Screenshot placeholder_: `docs/screenshots/04-hpanel-files.png`.

### G. Smoke test

Run through this in order. If any step fails, see `docs/runbook.md`.

1. `https://api.destinocojp.com/api/v1/health` returns `{ "status": "ok", "time": "..." }`.
2. `https://api.destinocojp.com/admin` shows a login form. Log in with the credentials from D.8.
3. `https://destinocojp.com/` loads, shows featured cars, and the header shows a JST clock.
4. `https://destinocojp.com/stock` shows a paginated grid.
5. `https://destinocojp.com/contact` — submit the inquiry form. Email lands at `export@destino.jp` within 1–2 minutes. Inquiry appears in the Filament panel under **Inquiries**.
6. `https://destinocojp.com/delivered` — submit a review. It appears in **Testimonials** with status **Pending**. Approve it. Refresh `/delivered` and confirm it appears.
7. `https://destinocojp.com/shipping` — the embedded PDF loads (or shows the fallback if no PDF has been uploaded yet — upload one via **Page Contents → shipping**).

### H. Backups

1. **Files & Backups** → **Backups**.
2. Confirm "Automatic backups" is ON. Hostinger Cloud Startup includes daily backups for the past 7 days; verify the most recent one was created today.
3. _Screenshot placeholder_: `docs/screenshots/05-hpanel-backups.png`.

---

## Subsequent deploys

This is what you do every time after the initial setup.

### Backend changes

```bash
ssh <user>@<host>
cd ~/domains/api.destinocojp.com/destino-backend
git pull
cd backend
composer install --no-dev --optimize-autoloader
php artisan migrate --force                  # only if migrations changed
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

If you changed seeders or want a fresh data dump (rare), `php artisan db:seed --force --class=<SeederName>`.

If you changed `.env`, clear and recache:
```bash
php artisan config:clear && php artisan config:cache
```

Test:
- `https://api.destinocojp.com/api/v1/health` returns 200.
- Open the admin and check that the change you intended is visible.

### Frontend changes

Local:
```bash
npm install              # only if package.json changed
npm run build
```

Then upload `dist/*` to `~/domains/destinocojp.com/public_html/`, replacing the previous build. Keep the `.htaccess` file in place.

Test:
- Hard-refresh `https://destinocojp.com/`. Service workers / browser cache can hide changes; `Ctrl+Shift+R` (Win) or `Cmd+Shift+R` (Mac).

### `.env` changes

Edit on the server, then `php artisan config:clear && php artisan config:cache`. The change takes effect within seconds.

---

## .env checklist (production)

Before going live, confirm every line in `backend/.env`:

- [ ] `APP_NAME=Destino`
- [ ] `APP_ENV=production`
- [ ] `APP_KEY=base64:...` (generated)
- [ ] `APP_DEBUG=false` ← critical, must be false
- [ ] `APP_URL=https://api.destinocojp.com`
- [ ] `APP_TIMEZONE=Asia/Tokyo`
- [ ] `DB_*` — real Hostinger creds, no `CHANGE_ME`
- [ ] `MAIL_*` — real SMTP creds, no `CHANGE_ME`
- [ ] `MAIL_INQUIRY_TO=export@destino.jp`
- [ ] `EXCHANGE_RATE_API_KEY` — real key
- [ ] `FRONTEND_URL=https://destinocojp.com`
- [ ] `LOG_CHANNEL=daily`, `LOG_LEVEL=info`
- [ ] `QUEUE_CONNECTION=database`
- [ ] `CACHE_STORE=file`

`ONE_PRICE_STOCK_API_*` may stay as placeholders until the client provides credentials. The sync command logs a warning and exits zero in that case — see `BLOCKERS.md`.

---

## Useful one-liners

Watch the Laravel log live:
```bash
tail -f ~/domains/api.destinocojp.com/destino-backend/backend/storage/logs/laravel-$(date +%Y-%m-%d).log
```

Run the sync command manually (mostly to test that creds work):
```bash
cd ~/domains/api.destinocojp.com/destino-backend/backend && php artisan stock:sync
```

Verify the cron is firing — should see "Running scheduled command" lines every minute:
```bash
tail -n 20 ~/domains/api.destinocojp.com/destino-backend/backend/storage/logs/laravel-$(date +%Y-%m-%d).log
```

Reset Filament admin password:
```bash
php artisan tinker
> $u = \App\Models\User::where('email','admin@destino.jp')->first(); $u->password = bcrypt('NEW_PASSWORD'); $u->save();
> exit
```
