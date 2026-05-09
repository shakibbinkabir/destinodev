# Destino Operations Runbook

Common production issues and how to fix them. Each section follows the same pattern: how to diagnose → how to fix.

The two domains:
- **Public site**: `https://destino-v.com` (React static).
- **API + admin**: `https://api.destino-v.com` (Laravel).

---

## 1. The cron stopped running

**Symptoms.** Scheduled jobs aren't firing: inquiry emails aren't sent, the One-Price Stock sync hasn't updated cars in hours, exchange rate is "stale".

### Diagnose

SSH into Hostinger and look at the Laravel log:
```bash
tail -n 50 ~/domains/api.destino-v.com/destino-backend/backend/storage/logs/laravel-$(date +%Y-%m-%d).log
```
You should see lines like `Running scheduled command: queue:work --stop-when-empty` every minute. If the log goes silent, the cron isn't firing.

Check the cron is still configured:
```bash
crontab -l
```
Should show one line, ending with `php artisan schedule:run`.

### Fix

If the cron is missing, re-add it via hPanel → **Cron Jobs**:
```
* * * * * cd /home/<user>/domains/api.destino-v.com/destino-backend/backend && php artisan schedule:run >> /dev/null 2>&1
```
Wait one minute, then re-check the log. You should see scheduler activity within 60 seconds.

If the cron _is_ configured but not firing, the most likely cause is the path. Test the command manually:
```bash
cd /home/<user>/domains/api.destino-v.com/destino-backend/backend && php artisan schedule:run
```
If that errors (path not found, php not found), fix the path/binary in the cron. Hostinger's PHP CLI is sometimes at `/usr/bin/php` or `/opt/alt/php82/usr/bin/php` — the cron will tell you which it expects when it fails.

---

## 2. Mail isn't being delivered (inquiry emails bouncing)

**Symptoms.** A customer fills the inquiry form, sees the success state, but no email arrives at `export@destino.jp`. The inquiry _does_ appear in the admin.

This means: the API persisted the row and queued the mail, but the queue couldn't deliver it (or hasn't run yet).

### Diagnose

Check the queue table for stuck jobs:
```bash
cd ~/domains/api.destino-v.com/destino-backend/backend
php artisan tinker
> DB::table('jobs')->count();
> DB::table('failed_jobs')->orderByDesc('failed_at')->limit(5)->get();
> exit
```

- `jobs` count should be near 0 most of the time. If it's > 5 and growing, the queue worker isn't running. → **Cron** issue, see section 1.
- `failed_jobs` shows jobs that errored out. The `exception` column tells you why. The most common SMTP failures:
  - `Connection could not be established with host smtp.X.com :stream_socket_client(): Unable to connect`. → SMTP host/port wrong, or firewall blocking.
  - `535 Authentication failed`. → Wrong username/password.
  - `550 Sender address rejected`. → `MAIL_FROM_ADDRESS` doesn't match an actual mailbox on your SMTP provider.

### Fix

Test SMTP creds directly:
```bash
php artisan tinker
> Mail::raw('test', fn($m) => $m->to('export@destino.jp')->subject('SMTP test'));
> exit
```
If this throws, the error message tells you what's wrong. Fix the relevant `MAIL_*` value in `.env`, then:
```bash
php artisan config:clear && php artisan config:cache
```

After fixing, retry the failed jobs:
```bash
php artisan queue:retry all
```

If the issue is the queue worker not running at all (jobs stuck, but no failed_jobs), the cron driving `queue:work --stop-when-empty` isn't firing — go to section 1.

---

## 3. `php artisan stock:sync` failed

**Symptoms.** API-source cars have stopped updating. The hourly sync hasn't run, or it crashed.

### Diagnose

Look at the log around when the sync was scheduled to run:
```bash
grep -i "stock:sync\|OnePriceStock" ~/domains/api.destino-v.com/destino-backend/backend/storage/logs/laravel-$(date +%Y-%m-%d).log | tail -30
```

You'll see one of:
- `One-Price Stock credentials not set; sync skipped.` — `.env` still has `CHANGE_ME_*`. This is intentional fallback; go set the real credentials and clear cache.
- `Stock sync failed: Connection timed out` — the upstream API is down. Local data is preserved (the service is built to no-op rather than wipe). Wait and retry, or call the vendor.
- `Stock sync failed: 401 Unauthorized` — the API key is wrong or expired. Update `ONE_PRICE_STOCK_API_KEY`, then `config:clear`.
- A normalization error (`undefined index`) — the upstream payload changed shape. This is a developer fix in `App\Services\OnePriceStockService::normalize()`. See `BLOCKERS.md` for the assumed shape.

### Fix

For credential issues: edit `.env`, then `php artisan config:clear && php artisan config:cache`. Then run the sync manually to confirm:
```bash
php artisan stock:sync
```
The command logs counts (created / updated / marked sold). On success it exits 0.

If the API is genuinely down, the existing local catalog stays put — there is no recovery action other than waiting for the vendor.

---

## 4. An image isn't displaying

**Symptoms.** A car page or the homepage shows a broken-image icon where a photo should be. The admin shows the image is uploaded.

The most common cause is a missing `storage:link` symlink. Public uploads live at `storage/app/public/...` but are served through `public/storage/...`, and the symlink between them needs to exist.

### Diagnose

```bash
ls -la ~/domains/api.destino-v.com/destino-backend/backend/public/storage
```
- If it shows a `->` arrow pointing to `../storage/app/public`, the symlink is fine. The image issue is elsewhere — check the URL the browser is requesting and confirm the file exists at `storage/app/public/<that path>`.
- If `storage` doesn't exist or is a real directory (no arrow), the symlink is missing.

### Fix

Recreate the symlink:
```bash
cd ~/domains/api.destino-v.com/destino-backend/backend
php artisan storage:link
```
Refresh the page. The image should now load.

If the symlink is fine but the file _is_ missing, the image was probably referenced before being uploaded, or was deleted. Re-upload via the admin.

---

## 5. The React build failed

**Symptoms.** `npm run build` errors out, or the deployed site shows a blank page / "module not found" in console.

### Diagnose

Run the build locally with full output:
```bash
npm run build
```

Common causes:
- **`Failed to resolve import './data/cars'` (or similar)** — leftover import after the data files were deleted in Stage 5. Search the codebase: `grep -rn "data/cars\|data/company\|data/testimonials\|data/makes" src/`. If any match, fix or remove those imports.
- **`VITE_API_BASE_URL is not defined`** — the `.env.production` file is missing or wasn't read. Confirm it exists at the repo root and contains `VITE_API_BASE_URL=https://api.destino-v.com/api/v1`. Vite reads `.env.production` automatically when `npm run build` runs.
- **TypeError or runtime error in the deployed app** — open browser devtools → Console. The error tells you which file. If it mentions an env var, the build was made without it; rebuild after fixing `.env.production`, then re-upload `dist/`.

### Fix

Once the build succeeds, upload `dist/*` to `~/domains/destino-v.com/public_html/`, replacing the old build. Make sure `.htaccess` (the SPA fallback rule) is preserved.

If the deployed site is blank but the build worked locally, your `.env.production` probably has the wrong API URL — the React app loaded but every fetch is 404'ing. Check the network tab in the browser; if you see requests going to `localhost:8000` from the production site, you uploaded a dev build. Rebuild with the production env file.

---

## 6. Exchange rate or YouTube feed shows "unavailable"

**Symptoms.** Header strip says "Rate unavailable" instead of `$1 = 148.32`. Or the homepage YouTube section disappears.

These endpoints are designed to fail gracefully — they cache successful responses for 12 hours (rate) / 1 hour (YouTube) and serve the cached value on upstream failure. "Unavailable" means there is no cached value.

### Diagnose

```bash
curl -i https://api.destino-v.com/api/v1/exchange-rate
curl -i https://api.destino-v.com/api/v1/youtube-feed
```

- 200 with `data.rate` → endpoint is working. Issue is on the React side (clear browser cache, hard refresh).
- 200 with `meta.stale: true` → upstream is down but cache is serving. Wait for upstream.
- 503 → upstream is down AND cache is empty. Check the next item:

```bash
grep -i "exchange.rate\|youtube" ~/domains/api.destino-v.com/destino-backend/backend/storage/logs/laravel-$(date +%Y-%m-%d).log | tail -20
```

For exchange rate: if the API key is wrong (`401`), update `EXCHANGE_RATE_API_KEY` in `.env` and clear cache.

For YouTube: if the channel ID returns 404 from YouTube, the channel ID is wrong. Update `YOUTUBE_CHANNEL_ID` in `.env`. (See the open blocker in `backend/BLOCKERS.md`.)

### Fix

After fixing creds:
```bash
php artisan config:clear && php artisan config:cache
php artisan cache:forget exchange_rate:usd:jpy
php artisan cache:forget youtube_feed:UC9r_ugFs9RL4OkeEAwztQ7g
```
Hit the endpoint once with curl to repopulate the cache.

---

## 7. The Filament admin login fails

**Symptoms.** You enter the right password, panel says "These credentials do not match our records."

### Diagnose

Confirm the user exists:
```bash
cd ~/domains/api.destino-v.com/destino-backend/backend
php artisan tinker
> \App\Models\User::where('email','admin@destino.jp')->exists();
> exit
```

If `false`, the user doesn't exist on this database. (Did you run the wrong seeder, or wipe the DB?)

### Fix

Recreate:
```bash
php artisan make:filament-user
```

Or reset password if the user does exist:
```bash
php artisan tinker
> $u = \App\Models\User::where('email','admin@destino.jp')->first(); $u->password = bcrypt('NEW_PASSWORD_HERE'); $u->save();
> exit
```

---

## 8. CORS blocks the React app from calling the API

**Symptoms.** Browser console shows "Blocked by CORS policy. The 'Access-Control-Allow-Origin' header is missing." All API requests fail.

### Diagnose

Confirm the `FRONTEND_URL` env var matches the actual domain the user is browsing from:
```bash
grep FRONTEND_URL ~/domains/api.destino-v.com/destino-backend/backend/.env
```
If it says `https://destinocojp.com` but you've migrated to `https://destino-v.com`, that's your bug.

### Fix

Update `FRONTEND_URL` in `.env`. Clear cache:
```bash
php artisan config:clear && php artisan config:cache
```

CORS is configured in `backend/config/cors.php` and reads `FRONTEND_URL` at runtime. The fix takes effect immediately after cache clear.

---

## 9. SSL certificate expired

**Symptoms.** Browser warns "Not Secure" or "Connection not private" on either domain.

### Fix

In hPanel → **SSL** → click **Renew** on the affected domain. Hostinger's Let's Encrypt auto-renews 14 days before expiry, but occasionally the auto-renew fails (DNS misconfig, account expired). Manual renewal takes < 5 minutes.

If renewal fails repeatedly, contact Hostinger support — the issue is on their side.

---

## 10. Where things live (quick reference)

| Thing | Location |
|---|---|
| Laravel logs | `backend/storage/logs/laravel-YYYY-MM-DD.log` |
| Failed queue jobs | `failed_jobs` MySQL table |
| Pending queue jobs | `jobs` MySQL table |
| Uploaded images | `backend/storage/app/public/...` (served via `/storage/...`) |
| Caches | `backend/bootstrap/cache/` and `backend/storage/framework/cache/` |
| Filament panel | `https://api.destino-v.com/admin` |
| Health endpoint | `https://api.destino-v.com/api/v1/health` |
| Sync command | `php artisan stock:sync` (cwd: `backend/`) |
| Open blockers | `backend/BLOCKERS.md` |

---

## When you're truly stuck

1. Check `backend/storage/logs/laravel-<today>.log` first. Most issues leave a stack trace there.
2. If the issue is on the React side (blank page, stale data), open browser devtools → Network tab. Look at the failed requests — the URL and status code tell you whether the API is responding wrong, the static assets are missing, or the env config is bad.
3. Reach out to the developer with: a screenshot of the error, the relevant log lines (last 30), and what you did before it broke.
