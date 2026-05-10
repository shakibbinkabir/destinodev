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
3. After creation, the subdomain root maps to a folder under your home directory; note the path (something like `/home/u472293838/domains/destinocojp.com/public_html/api.destinocojp.com`).
4. **SSL** → enable Let's Encrypt SSL on **both** domains. Wait 5–10 minutes for issuance to complete.
5. _Screenshot placeholder_: `docs/screenshots/01-hpanel-domains.png` — the domains panel showing both with SSL enabled.

### B. MySQL database

1. **Databases** → **Create Database**.
2. Name: `destino_prod` (or whatever your account allows). Set a strong password.
3. Note `DB_HOST`, `u472293838_destino`, `u472293838_destino`, `blu3@T0p#6969` — you'll paste them into `.env` shortly.
4. Whitelist remote access? Not needed; Laravel runs on the same host.
5. _Screenshot placeholder_: `docs/screenshots/02-hpanel-mysql.png` — the new database listed.

### C. Laravel deploy (`api.destinocojp.com`)

The Laravel app lives in `backend/` in the source repo. On Hostinger you can deploy via Git or by uploading a zip — Git is recommended.

1. **Git** → **Create Git Deployment**.
   - Repository: your private GitHub URL.
   - Branch: `main`.
   - Deploy path: the subdomain document root from step A — on Hostinger that's typically `domains/destinocojp.com/public_html/api.destinocojp.com` (subdomains live *under* the apex's `public_html`). Hostinger clones the **entire repo** into that folder, so afterwards `backend/`, `src/`, `dist/`, `package.json`, etc. all sit at the top level of the subdomain root.
2. Hostinger pulls the repo. Now SSH in (Advanced → SSH Access) and confirm the layout:
   ```bash
   cd ~/domains/destinocojp.com/public_html/api.destinocojp.com
   pwd     # /home/<user>/domains/destinocojp.com/public_html/api.destinocojp.com
   ls      # backend  CLAUDE.md  Destino_Backend_PRD.md  dist  docs  index.html  package.json  public  src  vite.config.js  ...
   ```
3. Point the web server at Laravel's `backend/public/` instead of the repo root. The repo's React/build files (`src/`, `dist/`, `package.json`, `index.html`, etc.) live alongside `backend/` but must not be served from the API host — moving the document root takes care of that in one step.

   **In hPanel** → **Domains** → `api.destinocojp.com` → **Manage** → set **Document Root** to:
   ```
   domains/destinocojp.com/public_html/api.destinocojp.com/backend/public
   ```
   Save. From now on, requests to `api.destinocojp.com` are served out of `backend/public/`, and the rest of the repo sits beside it but is not web-accessible.

   _If hPanel won't let you change the docroot_ (some plans hide the option), drop this `.htaccess` into the subdomain root as a fallback — it rewrites every request into `backend/public/`:
   ```apache
   # ~/domains/destinocojp.com/public_html/api.destinocojp.com/.htaccess
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteRule ^(.*)$ backend/public/$1 [L]
   </IfModule>
   ```
   Verify either way by hitting `https://api.destinocojp.com/api/v1/health` — you should get `{"status":"ok",...}`, **not** a directory listing or the contents of `index.html`.

4. Install dependencies. Before running composer, make sure Laravel's runtime directories exist — if any of `storage/framework/{views,sessions,cache/data}` or `bootstrap/cache` is missing, `package:discover` fails with `Please provide a valid cache path.` because Filament/Livewire boot the view compiler during composer's post-autoload hooks.
   ```bash
   cd ~/domains/destinocojp.com/public_html/api.destinocojp.com/backend
   mkdir -p storage/framework/{views,sessions,cache/data} storage/logs bootstrap/cache
   chmod -R 775 storage bootstrap/cache
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
7. Storage symlink + caches. **Don't use `php artisan storage:link` on Hostinger** — it fails with `Call to undefined function Illuminate\Filesystem\exec()` because `exec` is in PHP's `disable_functions` on shared/cloud plans. Create the symlink with the shell instead:
   ```bash
   ln -s ../storage/app/public public/storage
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   chmod -R 775 storage bootstrap/cache
   ```
   Verify: `ls -la public/storage` should print `storage -> ../storage/app/public`.
8. Create the first admin user **and assign the `super_admin` role** — otherwise Filament's `canAccessPanel()` gate rejects the login with the generic "These credentials do not match our records" error (the password is correct, but the user has no panel-access role yet, and Filament v3 hides that distinction on purpose).

   > **Note on Hostinger and `disable_functions`:** `php artisan tinker` does **not** work on this host because Psy Shell calls `shell_exec()` at startup and `shell_exec`/`exec` are blocked by PHP's `disable_functions` on shared/cloud plans. Use the dedicated `user:assign-role` command instead — that's why it exists.

   ```bash
   php artisan make:filament-user                          # prompts for name, email, password
   php artisan shield:generate --all                       # generates per-resource permission rows
   php artisan db:seed --force --class=RolesAndAdminSeeder # re-syncs role → permission mapping
   php artisan user:assign-role YOUR_EMAIL_HERE super_admin
   ```
   Replace `YOUR_EMAIL_HERE` with the email you used in the prompt. After this, `https://api.destinocojp.com/admin` accepts the login.

   **One-off SQL fallback** if the artisan command isn't deployed yet — run this in phpMyAdmin against the production DB:
   ```sql
   INSERT INTO model_has_roles (role_id, model_type, model_id)
   VALUES (
     (SELECT id FROM roles WHERE name = 'super_admin' AND guard_name = 'web'),
     'App\\Models\\User',
     (SELECT id FROM users WHERE email = 'YOUR_EMAIL_HERE')
   );
   ```

### D. Cron (Hostinger)

1. **Cron Jobs** → **Create Cron Job**.
2. Schedule: every minute (`* * * * *`).
3. Command:
   ```
   cd /home/<user>/domains/destinocojp.com/public_html/api.destinocojp.com/backend && php artisan schedule:run >> /dev/null 2>&1
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

After editing, clear cache and test. `tinker` is unusable on Hostinger (see C.8), so use the dedicated `mail:send-test` route instead — submit one entry through the live contact form at `https://destinocojp.com/contact` and verify it arrives at `MAIL_INQUIRY_TO`. The inquiry path exercises the same SMTP config as any other mail in the app, so a successful end-to-end test confirms credentials.

```bash
php artisan config:clear
php artisan config:cache
```
If the inquiry email arrives within 1–2 minutes (after the cron's `queue:work` fires), SMTP is working. If it doesn't, check `storage/logs/laravel-$(date +%Y-%m-%d).log` for `Symfony\Component\Mailer\Exception\TransportException` lines.

### F. React deploy (`destinocojp.com`)

The React build lives at the repo root. The apex docroot is `~/domains/destinocojp.com/public_html/` — on a fresh Hostinger account this folder will already contain two things:

- `default.php` — Hostinger's placeholder. **Delete it** before deploying, otherwise it gets served at `https://destinocojp.com/` instead of `index.html`.
- `api.destinocojp.com/` — the subdomain's folder, where the monorepo is cloned for the Laravel deploy (Section C). **Leave it alone** — Hostinger routes `api.destinocojp.com` through this folder at the vhost level, but the apex's `.htaccess` and the React build sit *next to* it without conflict.

1. On your local machine:
   ```bash
   npm install
   npm run build
   ```
2. The build output is in `dist/`. Upload **the contents** of `dist/` (not the folder itself) to `~/domains/destinocojp.com/public_html/` — alongside the existing `api.destinocojp.com/` folder. Use the **File Manager** in hPanel or SFTP. Before uploading, delete `default.php` from `public_html/` if it's still there.

   After the upload, `ls` of `~/domains/destinocojp.com/public_html/` should look roughly like:
   ```
   api.destinocojp.com/    assets/    index.html    favicon.ico    .htaccess    ...
   ```
   (i.e. the subdomain folder, plus the React build artifacts directly in the apex docroot.)

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
   This only affects requests to the apex (`destinocojp.com`). Subdomain hostnames don't traverse this file, so the `api.destinocojp.com/` folder under it is unaffected.

4. _Screenshot placeholder_: `docs/screenshots/04-hpanel-files.png`.

> **Optional — server-side build.** If `node` is available on the server (hPanel → **Advanced** → **Node.js**), you can skip the local build/upload entirely. The monorepo is already cloned under `api.destinocojp.com/` for the Laravel deploy, so:
> ```bash
> cd ~/domains/destinocojp.com/public_html/api.destinocojp.com
> npm install
> npm run build
> cp -r dist/* ../    # copies into ~/domains/destinocojp.com/public_html/
> ```
> Hostinger Cloud Startup ships Node, but versions vary across plans — confirm `node -v` matches what `package.json` expects before relying on this path.

### G. Smoke test

Run through this in order. If any step fails, see `docs/runbook.md`.

1. `https://api.destinocojp.com/api/v1/health` returns `{ "status": "ok", "time": "..." }`.
2. `https://api.destinocojp.com/admin` shows a login form. Log in with the credentials from C.8.
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
cd ~/domains/destinocojp.com/public_html/api.destinocojp.com
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

Then upload `dist/*` to `~/domains/destinocojp.com/public_html/`, replacing the previous build. Keep `.htaccess` in place, and **do not delete the `api.destinocojp.com/` folder** that sits alongside the React assets — it's the Laravel subdomain's repo and removing it takes the API down.

If Node is set up on the server, you can build in place instead:
```bash
cd ~/domains/destinocojp.com/public_html/api.destinocojp.com
git pull && npm install && npm run build
cp -r dist/* ../    # overwrite previous build in the apex docroot
```

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
tail -f ~/domains/destinocojp.com/public_html/api.destinocojp.com/backend/storage/logs/laravel-$(date +%Y-%m-%d).log
```

Run the sync command manually (mostly to test that creds work):
```bash
cd ~/domains/destinocojp.com/public_html/api.destinocojp.com/backend && php artisan stock:sync
```

Verify the cron is firing — should see "Running scheduled command" lines every minute:
```bash
tail -n 20 ~/domains/destinocojp.com/public_html/api.destinocojp.com/backend/storage/logs/laravel-$(date +%Y-%m-%d).log
```

Reset Filament admin password (Hostinger — `tinker` doesn't work here, so use SQL via phpMyAdmin against `u472293838_destino`):

1. Generate a bcrypt hash for the new password at <https://bcrypt-generator.com> (cost factor 12) or with PHP locally: `php -r "echo password_hash('NEW_PASSWORD', PASSWORD_BCRYPT);"`.
2. Run in phpMyAdmin → SQL tab:
   ```sql
   UPDATE users
   SET password = '$2y$12$REPLACE_WITH_BCRYPT_HASH', remember_token = NULL
   WHERE email = 'admin@destino.jp';
   ```
   Setting `remember_token = NULL` invalidates any "Remember me" cookies the old password issued.
