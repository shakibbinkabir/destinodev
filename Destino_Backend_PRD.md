# Destino Car Directory — Backend, Admin & Integration PRD

**Project:** Destino Car Directory Website  
**Client:** ZRN Group (operating Destino Co. Ltd.)  
**Phase:** Backend, Admin Panel, Integrations, Deployment  
**Status of Frontend:** Complete & approved (React 18 + Vite SPA)  
**This Document:** The single source of truth for the remaining work. If something is not in this document, it is out of scope. If something is in this document, it must be delivered exactly as specified or a written change must be agreed before deviation.

---

## 0. How to Read This Document

- **Sections 1–5** establish the current state, goals, and final architectural decisions. Read these before writing any code.
- **Section 6** is the stage-by-stage execution plan. Stages are sequential — finish a stage's acceptance criteria before starting the next.
- **Sections 7–9** are the detailed specs (database, REST API, admin panel). Refer back to these constantly during build.
- **Sections 10–12** are wiring and deployment.
- **Sections 13–15** are checklists and known gaps.

There is no deadline. Quality and completeness override speed. Do not cut corners to ship faster.

---

## 1. Current State Summary

### 1.1 What exists
A production-ready React 18 + Vite single-page application with 8 routes:

`/` (Home) · `/stock` · `/stock/:id` · `/about` · `/contact` · `/delivered` · `/auction` · `/shipping`

Plus 14 reusable components (Header, Footer, FloatingContact, PageTitle, JapanClock, ExchangeRate, SearchBar, FilterSidebar, CarCard, ImageGallery, InquiryForm, StatsStrip, ProcessSteps, TestimonialSlider, Partners, CTABanner).

All vehicle, auction, testimonial, partner, and company data currently lives in static JS files under `src/data/`:

- `src/data/cars.js` (22 cars)
- `src/data/auctions.js` (16 lots)
- `src/data/company.js` (company info + 12 delivered cars)
- `src/data/testimonials.js` (6 reviews)
- `src/data/makes.js` (filter facets)

A small Express dev server in `server/` and three Vercel serverless functions in `api/` (exchange-rate, youtube-feed, inquiry) exist but will be **decommissioned** in this phase.

### 1.2 What is missing or stubbed (the work this PRD covers)
1. No real database. All catalog data is hardcoded.
2. No admin panel. Nothing on the site is editable without a code change.
3. Inquiry form does not send email. It logs to console and lies on failure.
4. "Write Your Review" form on `/delivered` is a UI mock — submits to nothing.
5. `/api/shipping-info-pdf` is referenced by the frontend but does not exist.
6. `/auction` page is purely cosmetic. Real auction is external (`autobidjp.com`); per client direction, the internal page becomes a managed showcase, not a live bidding system.
7. One-Price Stock external API not integrated. Cars marked `source: "api"` are placeholders.
8. Hardcoded exchange-rate API key committed to repo.
9. Partner logos are placeholder (DESTINO logo); social links in `company.js` are `"#"`.
10. No image-upload pipeline. All imagery is Unsplash CDN URLs.
11. Vercel serverless-side `/api/inquiry` does not exist, so production form submissions 404.

### 1.3 Frontend constraints
The existing React code must not be rewritten. Changes to it are limited to:
- Replacing static `src/data/*.js` imports with API client calls.
- Adding loading and error states to pages that now fetch data.
- Reading the API base URL from a Vite environment variable (`VITE_API_BASE_URL`).
- Honest success/failure handling on the inquiry and review forms.

No restructuring of components, routing, styles, or page layouts.

---

## 2. Goals of This Phase

By the end of Stage 5:

1. Every piece of content visible on the public site is editable from a Filament admin panel by a non-technical user.
2. Every inquiry submission reaches `export@destino.jp` reliably and is also stored in the admin panel for audit.
3. Customer reviews can be submitted from `/delivered` and are visible publicly only after admin approval.
4. Cars from the One-Price Stock external API are synced automatically on a schedule and merged with in-house cars in a single unified catalog.
5. The shipping information page serves a real, admin-uploaded PDF.
6. Exchange rate, YouTube feed, and other previously serverless concerns are served from the Laravel backend with proper caching.
7. The site is deployed end-to-end on Hostinger Cloud Startup — React static build + Laravel API on a subdomain — under SSL, with daily backups verified.
8. No secrets in source control. Everything sensitive lives in environment variables.

---

## 3. Architecture Decision Record

### Decision
- **Frontend:** Keep the existing React + Vite SPA, served as static files from `destinocojp.com`.
- **Backend:** Laravel 11 (PHP 8.2+) deployed at `api.destinocojp.com`.
- **Admin panel:** Filament 3 mounted at `api.destinocojp.com/admin`.
- **Database:** MySQL 8 (Hostinger-managed).
- **Storage:** Local public disk (`storage/app/public`) symlinked to `public/storage`. Hostinger 100 GB NVMe is sufficient for projected image volume.
- **Mail:** SMTP via Hostinger's mail server initially. Upgradeable to a transactional provider (SES, Postmark, Resend) without code change — provider lives in env.
- **Scheduling:** Laravel Scheduler triggered by a single Hostinger cron entry running `php artisan schedule:run` every minute.
- **Caching:** Laravel cache, file driver. Upgrade path to Redis is left open but not required.

### Rationale
- The contract specifies Laravel + Filament. This phase honors that.
- Hostinger Cloud Startup natively supports PHP/MySQL with no special configuration. Node.js apps are possible on Hostinger but require more setup and are less stable on shared/cloud tiers.
- Splitting the React static build from the Laravel API on different subdomains avoids any conflict between Laravel's routing and the SPA's client-side routing, simplifies CORS and SSL, and lets either side be redeployed independently.
- Filament gives a turnkey admin panel that covers ~95% of CRUD needs without custom UI work.

### Rejected alternatives
- **Single Laravel app serving the React build from `public/`.** Rejected: couples deploys, complicates SPA fallback routing, mixes static asset serving with API.
- **Node.js (Express/Adonis/Nest) backend.** Rejected: contract specifies PHP/Laravel; Hostinger Cloud Startup is PHP-first.
- **Headless CMS (Strapi/Directus/Sanity).** Rejected: extra hosting surface, departs from contract, learning curve for the client's eventual maintainer.

---

## 4. Tech Stack (Final)

| Layer | Choice | Notes |
|---|---|---|
| Frontend | React 18 + Vite 5 | Existing, unchanged |
| Backend framework | Laravel 11 | PHP 8.2 minimum |
| Admin panel | Filament 3 | With Shield plugin for role/permission management |
| Database | MySQL 8 | Hostinger-provided |
| ORM | Eloquent | Default |
| Validation | Laravel FormRequest | One per write endpoint |
| API responses | Laravel API Resources | Consistent shape |
| Storage | Local public disk | `storage/app/public` |
| Image processing | Intervention Image v3 | For thumbnail generation if needed |
| Mail | Laravel Mail + SMTP | Provider configurable via env |
| Queue | Database driver | Used for inquiry email dispatch |
| Scheduler | Laravel Scheduler | Cron-driven |
| HTTP client | Laravel HTTP facade | For exchange-rate and stock-API calls |
| Logging | Laravel Log + daily files | Rotated, 14-day retention |
| Auth (admin) | Filament's built-in + Shield | Single super-admin to start |
| API auth | None for public read endpoints; signed token for admin-protected endpoints if any | Inquiry POST is public |
| CORS | `fruitcake/laravel-cors` (built into Laravel 11) | Allowed origins: production domain only |
| Rate limiting | Laravel's `throttle` middleware | Per route |
| Tests | PHPUnit / Pest | Smoke tests minimum (see §6.5) |

No additional frameworks, libraries, or services are introduced beyond what is listed above.

---

## 5. Hosting Topology

```
                       Cloudflare / Hostinger CDN
                                  │
              ┌───────────────────┼───────────────────┐
              │                                       │
   destinocojp.com  (or destino.jp)            api.destinocojp.com
   ─────────────                             ───────────────────
   React SPA (Vite build)                    Laravel 11 app
   public_html/ → dist/ contents             public_html/ → Laravel public/
   index.html + assets                       /api/v1/* → REST endpoints
   SPA fallback to index.html                /admin → Filament panel
                                             /storage/* → public uploads
```

- Two separate Hostinger "websites" (subdomains) under one Cloud Startup account.
- One MySQL database, used by Laravel only.
- One cron entry on the Laravel subdomain.
- Free Let's Encrypt SSL on both subdomains (Hostinger auto-provisions).
- Daily automatic backups enabled at the account level (already part of Cloud Startup).

---

## 6. Development Stages

There are 5 stages. Each has goals, tasks, deliverables, and acceptance criteria. Do not start a stage until the previous stage's acceptance criteria are fully met.

---

### Stage 1 — Foundation & Environment

**Goal:** A working Laravel + Filament skeleton, locally and on Hostinger, ready to host the data layer.

**Tasks**

1.1 Set up local Laravel 11 project in a new folder `destino-backend/` (sibling to the existing React repo, separate Git repo).

1.2 Install and configure:
- Filament 3 (`filament/filament`)
- Filament Shield (`bezhansalleh/filament-shield`) for permissions
- Intervention Image v3
- Laravel Sanctum (only if API tokens become needed later — install but do not configure routes yet)

1.3 Configure `.env` with:
- App name, URL, locale (`en`), timezone (`Asia/Tokyo`)
- DB credentials (local MySQL for dev)
- Mail (local: `MAIL_MAILER=log` for development)
- `EXCHANGE_RATE_API_KEY` (move from hardcoded value)
- `ONE_PRICE_STOCK_API_URL` and `ONE_PRICE_STOCK_API_KEY` (placeholders until client provides)
- `YOUTUBE_CHANNEL_ID=UC9r_ugFs9RL4OkeEAwztQ7g`
- `FRONTEND_URL=https://destinocojp.com` (used in CORS and email links)

1.4 Configure CORS (`config/cors.php`) to allow only `FRONTEND_URL` for `/api/*` routes.

1.5 Create the first Filament super-admin user via `php artisan make:filament-user`.

1.6 Set up API versioning: all public endpoints under `/api/v1/`. Routes in `routes/api.php`.

1.7 Implement a `GET /api/v1/health` endpoint returning `{ "status": "ok", "time": ISO8601 }`. This is the smoke endpoint for every deploy.

1.8 Create the Hostinger subdomain `api.destinocojp.com`, provision SSL, create a MySQL database, and deploy the empty Laravel skeleton via Git or File Manager. Confirm `/api/v1/health` returns 200 over HTTPS.

1.9 Set up the production cron:
```
* * * * * cd /home/<user>/api.destinocojp.com && php artisan schedule:run >> /dev/null 2>&1
```

1.10 Confirm the React app, deployed as static files at `destinocojp.com`, loads independently. No wiring yet.

**Deliverables**
- Laravel repo on GitHub (private), `main` branch deployable.
- Working `https://api.destinocojp.com/api/v1/health`.
- Working `https://api.destinocojp.com/admin` with super-admin login.
- React app continuing to serve at the apex domain unchanged.

**Acceptance criteria**
- [ ] Health endpoint returns 200 under HTTPS in production.
- [ ] Filament admin login works in production.
- [ ] No secret values exist in source control. `.env` is gitignored. `.env.example` is committed.
- [ ] CORS rejects requests from origins other than `FRONTEND_URL`.
- [ ] Cron is firing (`storage/logs/laravel.log` shows scheduler heartbeat).

---

### Stage 2 — Data Layer & Admin Panel

**Goal:** Every piece of content currently in `src/data/*.js` is now in MySQL and editable from Filament. Image uploads work end-to-end.

**Tasks**

2.1 Create migrations, models, factories, and seeders for each table specified in §7. Tables in this stage:
- `cars`, `car_images`
- `delivered_cars`
- `inquiries`
- `testimonials` (handles both static testimonials and customer-submitted reviews)
- `page_contents` (about, shipping, contact body copy)
- `hero_slides`
- `partners`
- `services` (the 6 services on About page)
- `process_steps` (the How It Works steps)
- `settings` (key-value, for things like phone, fax, social links, etc.)

2.2 Seed data:
- Migrate every record from `src/data/cars.js` into the `cars` table via a `CarsSeeder`. Image URLs from Unsplash should be downloaded into `storage/app/public/cars/<id>/` during seeding so the site stops depending on Unsplash. If automated download is not feasible, store the URL in `car_images.path` as an absolute URL and flag a follow-up to replace with real photography.
- Migrate `deliveredCars` from `src/data/company.js` similarly.
- Migrate the 6 testimonials from `src/data/testimonials.js` with `status='approved'`.
- Migrate makes/body types/fuel types into the appropriate lookup approach (see §7.10).
- Populate `settings` with company info from `src/data/company.js` (phone, fax, email, WhatsApp, address, business hours, representative, JUMVEA membership flag, social URLs as nullable).
- Populate `page_contents` with body copy from About / Shipping / Contact.
- Populate `partners`, `services`, `process_steps`, `hero_slides` from the existing pages.

2.3 Build a Filament resource for each model. See §9 for required list columns, filters, form fields, and actions per resource.

2.4 Image upload strategy:
- Use Filament's `FileUpload` component with `->disk('public')->directory('cars')` (or appropriate per-resource directory).
- For multi-image fields (cars), use `FileUpload::make('images')->multiple()->reorderable()`. Persist via the `car_images` related table.
- Original files only at this stage. Thumbnail generation via Intervention Image is a Stage 4 enhancement if performance demands it.

2.5 Configure Filament Shield with at least two roles: `super_admin` (full access) and `editor` (everything except user management and settings). Defer fine-grained permissions until the client requests them.

2.6 Set up file storage symlink (`php artisan storage:link`) and confirm uploaded images are accessible at `https://api.destinocojp.com/storage/<path>`.

**Deliverables**
- All migrations, models, factories, seeders committed.
- One Filament resource per table as specified.
- All static frontend data successfully imported via `php artisan db:seed`.
- Image uploads visible via public URLs.

**Acceptance criteria**
- [ ] `php artisan migrate:fresh --seed` rebuilds the database from zero with all current site content.
- [ ] Every entity above is fully manageable (create/edit/delete) from Filament.
- [ ] An admin user can upload an image to a car, save, and see the image at a public URL.
- [ ] No errors in `storage/logs/laravel.log` after a full seed.

---

### Stage 3 — Public REST API

**Goal:** Every endpoint the React frontend will call exists, returns the expected shape, validates input, handles errors, and is rate-limited where appropriate.

**Tasks**

3.1 Implement every endpoint in §8. For each:
- Route in `routes/api.php` under the `api/v1` prefix.
- Controller in `app/Http/Controllers/Api/V1/`.
- FormRequest class for any POST endpoint.
- API Resource class (`app/Http/Resources/`) for response shaping. Response field names must match what the existing React components already consume (see existing `src/data/*.js` for shape reference).
- Throttle middleware on POST endpoints: `throttle:10,1` (10 per minute per IP) for inquiries and reviews.

3.2 Pagination on `/api/v1/cars` uses Laravel's standard paginator. Default page size 9 (matches existing UI). Max page size 50.

3.3 Filtering on `/api/v1/cars` supports the dimensions already in `FilterSidebar`: `make`, `body_type`, `transmission`, `fuel`, `year_from`, `year_to`, `price_min`, `price_max`, `source` (all|inhouse|api), and a free-text `q` parameter that searches make, model, and description.

3.4 Sorting on `/api/v1/cars`: `latest` (default, by `created_at` desc), `price_asc`, `price_desc`, `year_desc`, `mileage_asc`.

3.5 `/api/v1/cars/{id}/similar` returns up to 6 cars matching make OR body_type, excluding the current car, ordered by closest year.

3.6 Response envelope is consistent across all endpoints:
```json
{
  "data": ...,
  "meta": { "pagination": ... }   // only on paginated endpoints
}
```
Error responses:
```json
{
  "message": "Human-readable error",
  "errors": { "field": ["validation message"] }   // 422 only
}
```

3.7 Document the API in a Postman collection committed to the repo at `docs/destino-api.postman_collection.json`, with example requests and responses for every endpoint.

3.8 Write smoke tests (Pest preferred) for at minimum:
- `GET /api/v1/cars` returns paginated list.
- `GET /api/v1/cars/{id}` returns 404 for unknown ID, 200 for known.
- `POST /api/v1/inquiries` with valid payload returns 201, with invalid returns 422.
- `POST /api/v1/reviews` with valid payload returns 201 and creates a `pending` testimonial.

**Deliverables**
- All endpoints in §8 implemented and live on `api.destinocojp.com`.
- Postman collection in repo.
- Pest test suite passing in CI (or locally if no CI is configured).

**Acceptance criteria**
- [ ] Every endpoint in §8 returns the documented shape, verified against the Postman collection.
- [ ] Validation errors return 422 with a structured `errors` object.
- [ ] Filter, sort, and pagination on `/api/v1/cars` produce results matching the FilterSidebar's UI behavior.
- [ ] Rate limiting on POST endpoints is enforced (verified by hammering the endpoint in Postman).
- [ ] No N+1 queries in `/api/v1/cars` (verified with Laravel Debugbar locally or `DB::listen` log).

---

### Stage 4 — Integrations & Pipelines

**Goal:** The site is no longer cosmetic. Inquiries reach the inbox, the stock API populates the catalog, the exchange rate is real, the shipping PDF works.

**Tasks**

4.1 **Inquiry email pipeline**
- Create a `NewInquiryNotification` Mailable and a `CustomerInquiryConfirmation` Mailable.
- On `POST /api/v1/inquiries`: persist the inquiry, then queue both mails (admin notification to `export@destino.jp`, confirmation to the customer's email). Use the database queue driver. The scheduled `queue:work` keeps it running (see 4.5).
- The admin email contains: all submitted fields, the related car if any (with a deep link to the car's admin page), the source (which page/form it came from), the timestamp in JST, and the customer's IP.
- The customer confirmation is a polite acknowledgment with the company's WhatsApp and email for follow-up.
- All mails go through SMTP. Configure SMTP via env. Provide working credentials for Hostinger SMTP (the client will supply or create `noreply@destino.jp` or similar).

4.2 **Review submission moderation**
- `POST /api/v1/reviews` creates a `testimonial` with `status='pending'`.
- A new pending review triggers an admin email to `export@destino.jp` with a deep link to the Filament edit page.
- The Filament Testimonial resource has bulk and per-row "Approve" and "Reject" actions.
- Only `status='approved'` testimonials are returned by `GET /api/v1/testimonials`.

4.3 **One-Price Stock API integration**
- Service class `App\Services\OnePriceStockService` encapsulates HTTP calls.
- Console command `php artisan stock:sync` performs:
  - Fetch all current listings from the API.
  - Upsert `cars` rows where `source='api'` matched by `external_id`.
  - For each listing, normalize the API's field names into the `cars` schema (see §7.1). Map images into `car_images`.
  - Mark cars present locally but absent in the latest API response as `status='sold'` (do not delete).
- Schedule the command to run hourly: `$schedule->command('stock:sync')->hourly()->withoutOverlapping();`
- Log every sync: count fetched, created, updated, marked sold, errors.
- Failure mode: on API error, the existing local data must remain untouched. Do not wipe the catalog.
- **Note for developer:** the One-Price Stock API documentation must be supplied by the client before this task starts. Without it, the service class is a stub against an assumed shape. Request the docs explicitly. See §15.

4.4 **Exchange rate proxy**
- `GET /api/v1/exchange-rate` returns `{ "data": { "from": "USD", "to": "JPY", "rate": 148.32, "fetched_at": "2026-..." } }`.
- Backed by Laravel cache, key `exchange_rate:usd:jpy`, TTL 12 hours.
- On API failure, return the most recent cached value with a `stale: true` flag. Never return an error to the client unless cache is also empty.
- Source: `exchangerate-api.com` using `EXCHANGE_RATE_API_KEY` from env.

4.5 **YouTube feed proxy**
- `GET /api/v1/youtube-feed` parses the channel RSS for `YOUTUBE_CHANNEL_ID`, returns up to 6 most recent videos with `videoId`, `title`, `published`, `thumbnail`, `views`.
- Cache TTL 1 hour.
- Same stale-fallback strategy as exchange rate.

4.6 **Shipping PDF**
- Add a `shipping_pdf_path` setting (or a dedicated field on the `page_contents` row for `shipping`).
- Filament admin can upload a PDF via the Shipping page editor.
- `GET /api/v1/shipping-pdf` returns a 302 redirect to the public storage URL of the current PDF, or 404 if none uploaded.
- The frontend's iframe `src` is updated to point to this endpoint.

4.7 **Queue worker**
- Use `php artisan queue:work --stop-when-empty` invoked every minute via the Laravel scheduler. This avoids needing a long-running supervisor process on Hostinger shared/cloud hosting:
  ```php
  $schedule->command('queue:work --stop-when-empty --tries=3')->everyMinute()->withoutOverlapping();
  ```

4.8 **Audit existing serverless code**
- Confirm the React app no longer references `/api/exchange-rate`, `/api/youtube-feed`, `/api/inquiry`, or `/api/shipping-info-pdf` from Vercel functions. Remove the `api/` and `server/` directories from the React repo to avoid confusion. (This actually happens in Stage 5 alongside the frontend wiring, but flag the dependency now.)

**Deliverables**
- Working email send from a real inquiry, landing in `export@destino.jp`.
- `php artisan stock:sync` successfully importing API listings (or a stub with a clear TODO if API docs are still pending).
- Exchange rate and YouTube endpoints returning live, cached data on `api.destinocojp.com`.
- Shipping page PDF upload and public access verified.
- Queue worker running on schedule, evidenced by inquiry emails landing within 1–2 minutes.

**Acceptance criteria**
- [ ] A real inquiry submitted through the production frontend email is delivered to `export@destino.jp` and the customer's confirmation reaches their inbox.
- [ ] Inquiry is also visible in the Filament admin panel with status `new`.
- [ ] A submitted review appears in admin as `pending` and only becomes visible on the public site after approval.
- [ ] `php artisan stock:sync` runs without error and updates the catalog (or, if API access not yet provided, the command exists, fails gracefully, and is documented).
- [ ] Exchange rate endpoint serves the cached value when the upstream API is unreachable (verified by temporarily setting an invalid key).
- [ ] Shipping page loads the PDF from the new endpoint.

---

### Stage 5 — Frontend Wiring, QA & Deployment

**Goal:** The React app talks to the Laravel API. Static data files are removed. Production is fully wired and verified.

**Tasks**

5.1 Add `VITE_API_BASE_URL=https://api.destinocojp.com/api/v1` to `.env.production` in the React repo. For local development, default to `http://127.0.0.1:8000/api/v1`.

5.2 Create a thin API client in `src/api/`:
- `src/api/client.js` — fetch wrapper, base URL, JSON handling, error normalization.
- `src/api/cars.js` — `listCars(filters)`, `getCar(id)`, `getSimilarCars(id)`.
- `src/api/delivered.js` — `listDeliveredCars(filters)`.
- `src/api/testimonials.js` — `listTestimonials()`.
- `src/api/inquiries.js` — `submitInquiry(payload)`.
- `src/api/reviews.js` — `submitReview(payload)`.
- `src/api/site.js` — `getSettings()`, `getPage(slug)`, `getMakes()`, `getHeroSlides()`, `getPartners()`, `getProcessSteps()`, `getServices()`, `getExchangeRate()`, `getYouTubeFeed()`.

5.3 Page-by-page wiring (modify only data-loading code; do not touch layout/styling):
- **HomePage** — fetch hero slides, featured cars (6), recently added (4), testimonials, YouTube videos, settings.
- **StockListPage** — fetch cars with filters from URL/state, fetch makes/body types/etc. for sidebar.
- **SingleCarPage** — fetch car + similar.
- **AboutPage** — fetch page content + services + process steps + partners + settings.
- **ContactPage** — fetch settings (address, phone, fax, email, WhatsApp, hours, social).
- **DeliveredPage** — fetch delivered cars + on submit, call `submitReview` and show real success/failure.
- **AuctionPage** — out of scope for backing now; leave on static data **or** drop the page entirely (decide with client; see §15).
- **ShippingPage** — fetch page content + shipping PDF URL.

5.4 Update `InquiryForm` component to call `submitInquiry`, show real success state on 201, real error state on failure (with a "try again" affordance and the WhatsApp fallback link).

5.5 Add a global loading spinner / skeleton state to each fetch site. Style consistent with existing CSS variables. No new design system pieces.

5.6 Add a 404 route component for unknown URLs (the brief flagged this gap).

5.7 Remove the `api/` and `server/` directories from the React repo. Update `package.json` to drop `concurrently`, `express`, `cors`, `better-sqlite3`. Update `vite.config.js` to remove the `/api` proxy. Update `vercel.json` to drop the API passthrough — the React deploy is now pure static.

5.8 Final QA pass — see §13 for the master checklist.

5.9 Deploy:
- Build React (`npm run build`) and upload `dist/` contents to Hostinger's `public_html` for `destinocojp.com`.
- Push Laravel `main` to `api.destinocojp.com`.
- Run `php artisan migrate --force` and `php artisan db:seed --force` once on production.
- Run `php artisan storage:link`, `php artisan config:cache`, `php artisan route:cache`, `php artisan view:cache`.
- Verify SSL on both subdomains.
- Verify cron is firing.
- Submit a test inquiry. Confirm it lands in the inbox.
- Submit a test review. Approve it. Confirm it appears on `/delivered`.

5.10 Handover documentation in `docs/`:
- `docs/admin-guide.md` — how the client adds a car, manages inquiries, approves reviews, edits page content, uploads the shipping PDF, etc. Plain-language, screenshots included.
- `docs/deployment.md` — step-by-step redeploy instructions for both repos.
- `docs/runbook.md` — common issues (cron stopped, mail bouncing, sync failed) and how to diagnose.

**Deliverables**
- React repo updated and deployed.
- Laravel repo deployed and operational.
- All three docs in `docs/`.
- Master checklist (§13) fully ticked.

**Acceptance criteria**
- See §13.

---

## 7. Database Schema (Detailed)

All tables use `id` as bigint auto-increment primary key, `created_at` and `updated_at` timestamps, soft deletes on `cars` and `inquiries` only.

### 7.1 `cars`
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| external_id | varchar(100) nullable, unique | One-Price Stock API id; null for in-house |
| make | varchar(60) | indexed |
| model | varchar(120) | indexed |
| year | smallint unsigned | indexed |
| price_jpy | decimal(12,2) | FOB Japan |
| mileage_km | int unsigned | |
| fuel | enum('gasoline','hybrid','ev','diesel') | indexed |
| transmission | enum('automatic','manual','cvt') | |
| body_type | varchar(60) | indexed |
| engine_size | varchar(20) nullable | null for EV |
| color | varchar(40) | |
| drive_type | enum('2wd','4wd','awd','fwd','rwd') | |
| seats | tinyint unsigned | |
| doors | tinyint unsigned | |
| condition | varchar(40) | e.g. "Excellent", "Good" |
| source | enum('inhouse','api') | indexed |
| featured | boolean default false | indexed |
| badge | varchar(40) nullable | "New Arrival", "Hot Deal", etc. |
| battery_capacity | varchar(40) nullable | EV/hybrid only |
| motor_output | varchar(40) nullable | EV/hybrid only |
| description | text | |
| status | enum('available','sold','hidden') default 'available' | indexed |
| created_at, updated_at, deleted_at | timestamps | |

Composite indexes: (`source`, `status`, `featured`), (`make`, `model`).

### 7.2 `car_images`
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| car_id | bigint FK cars.id | cascade delete |
| path | varchar(500) | relative to public disk, OR absolute URL for legacy seeded data |
| sort_order | smallint default 0 | |
| is_primary | boolean default false | exactly one per car |

### 7.3 `delivered_cars`
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| make | varchar(60) | |
| model | varchar(120) | |
| year | smallint unsigned | |
| customer_name | varchar(120) | |
| destination_country | varchar(80) | indexed |
| destination_city | varchar(80) nullable | |
| delivery_date | date | indexed |
| testimonial_text | text nullable | |
| image_path | varchar(500) | |
| status | enum('published','hidden') default 'published' | |

### 7.4 `inquiries`
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| name | varchar(120) | |
| email | varchar(180) | |
| phone | varchar(40) nullable | |
| country | varchar(80) nullable | |
| message | text | |
| car_id | bigint FK cars.id nullable | set null on delete |
| car_reference | varchar(120) nullable | free-text fallback when car_id unknown |
| source | enum('contact_page','single_car','homepage','footer','other') | |
| status | enum('new','in_progress','replied','closed','spam') default 'new' | indexed |
| ip_address | varchar(45) nullable | |
| user_agent | varchar(500) nullable | |
| admin_notes | text nullable | |
| created_at, updated_at, deleted_at | timestamps | |

### 7.5 `testimonials`
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| name | varchar(120) | |
| country | varchar(80) nullable | |
| vehicle | varchar(120) nullable | |
| rating | tinyint unsigned | 1-5, validated |
| text | text | |
| image_path | varchar(500) nullable | |
| status | enum('pending','approved','rejected') default 'pending' | indexed |
| featured | boolean default false | for homepage slider |
| email | varchar(180) nullable | only collected on customer-submitted reviews, never displayed publicly |

### 7.6 `page_contents`
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| slug | varchar(60) unique | 'about', 'shipping', 'contact', 'home_intro', etc. |
| title | varchar(200) | |
| body | longtext | HTML or markdown — pick markdown, render with a safe parser on the frontend |
| meta_title | varchar(200) nullable | |
| meta_description | varchar(300) nullable | |
| extras | json nullable | for slug-specific structured fields, e.g. shipping_pdf_path |

### 7.7 `hero_slides`
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| title | varchar(200) | |
| subtitle | varchar(300) nullable | |
| image_path | varchar(500) | |
| cta_text | varchar(60) nullable | |
| cta_url | varchar(300) nullable | |
| sort_order | smallint default 0 | |
| active | boolean default true | indexed |

### 7.8 `partners`
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| name | varchar(120) | |
| logo_path | varchar(500) | |
| url | varchar(300) nullable | |
| sort_order | smallint default 0 | |
| active | boolean default true | |

### 7.9 `services`, `process_steps`
Both follow the same structure:
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| title | varchar(200) | |
| description | text | |
| icon | varchar(60) nullable | lucide-react icon name string |
| sort_order | smallint default 0 | |
| active | boolean default true | |

### 7.10 Lookup data (makes, body_types, fuel_types)
**Decision:** keep these as enums where the field is constrained (fuel, transmission, drive_type), and as derived distinct values from the `cars` table for `make` and `body_type`. The `GET /api/v1/makes` endpoint returns the union of distinct makes across all available cars, alphabetized. This keeps the admin from having to maintain a separate makes table while still letting the FilterSidebar populate dynamically.

If, during build, the client requests editable order or display names for makes, introduce a `makes` lookup table at that point.

### 7.11 `settings`
Key-value store. Each row:
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| key | varchar(120) unique | |
| value | longtext | |
| type | enum('string','int','bool','json','url','email','phone') default 'string' | for admin UI hint |
| group | varchar(60) nullable | 'company', 'social', 'seo', etc. |
| label | varchar(200) nullable | human-readable label for admin UI |

Seed keys (initial):
- `company.name`, `company.email`, `company.phone`, `company.fax`, `company.whatsapp_url`, `company.address`, `company.business_hours`, `company.representative`, `company.jumvea_member` (bool)
- `social.facebook`, `social.instagram`, `social.youtube`, `social.linkedin`, `social.x`
- `seo.default_meta_title`, `seo.default_meta_description`
- `integrations.youtube_channel_id`

---

## 8. REST API Specification

All endpoints under `https://api.destinocojp.com/api/v1/`. All responses JSON. Times in ISO 8601 UTC unless otherwise noted.

### 8.1 Cars

**`GET /cars`** — list with filtering, sorting, pagination.

Query params:
- `q` (string) — free text
- `make`, `body_type`, `transmission`, `fuel` (string) — exact match
- `year_from`, `year_to` (int)
- `price_min`, `price_max` (int)
- `source` — `all` (default), `inhouse`, `api`
- `featured` (bool)
- `sort` — `latest` (default), `price_asc`, `price_desc`, `year_desc`, `mileage_asc`
- `page` (int, default 1)
- `per_page` (int, default 9, max 50)

Response 200:
```json
{
  "data": [ { ...CarResource } ],
  "meta": {
    "pagination": {
      "current_page": 1,
      "per_page": 9,
      "total": 124,
      "last_page": 14
    }
  }
}
```

**`GET /cars/{id}`** — single car. 200 with `{ "data": CarResource }`. 404 if not found or status='hidden'.

**`GET /cars/{id}/similar`** — up to 6 similar cars. 200 with `{ "data": [...] }`.

`CarResource` shape (matches the field names already used by the React components — confirm against `src/data/cars.js`):
```json
{
  "id": 1,
  "make": "Toyota",
  "model": "Land Cruiser 300",
  "year": 2023,
  "price": 12500000,
  "mileage": 15000,
  "fuel": "gasoline",
  "transmission": "automatic",
  "body_type": "SUV",
  "engine_size": "3.5L",
  "color": "Pearl White",
  "drive_type": "4wd",
  "seats": 7,
  "doors": 5,
  "condition": "Excellent",
  "source": "inhouse",
  "featured": true,
  "badge": "New Arrival",
  "battery_capacity": null,
  "motor_output": null,
  "description": "...",
  "images": [
    "https://api.destinocojp.com/storage/cars/1/01.jpg",
    "..."
  ]
}
```

### 8.2 Delivered Cars

**`GET /delivered-cars`** — query params: `country`, `year`, `page`, `per_page`. Default `per_page=12`.

Response includes country and year facets in `meta.facets` so the frontend filter chips can populate.

### 8.3 Testimonials

**`GET /testimonials`** — only `status='approved'`. Optional `?featured=true` for homepage. No pagination — limit 50.

### 8.4 Inquiries

**`POST /inquiries`** — public, throttled `10/minute/IP`.

Request body:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+254712345678",
  "country": "Kenya",
  "message": "Interested in this Land Cruiser.",
  "car_id": 1,
  "car_reference": null,
  "source": "single_car"
}
```

Validation: `name` required string max 120, `email` required email max 180, `message` required string max 5000, `source` required in enum, `car_id` integer exists in cars or null.

Response 201:
```json
{ "data": { "id": 42, "received_at": "2026-..." } }
```

### 8.5 Reviews

**`POST /reviews`** — public, throttled `5/minute/IP`. Creates a `testimonial` with `status='pending'`.

Request body:
```json
{
  "name": "John Smith",
  "country": "UK",
  "vehicle": "Toyota Hiace 2022",
  "rating": 5,
  "text": "Excellent service from Destino...",
  "email": "john@example.com"
}
```

Response 201: `{ "data": { "id": 18 } }`.

### 8.6 Site & content

- **`GET /settings`** — all settings as `{ key: value }`. Cached 5 min.
- **`GET /page/{slug}`** — `about`, `shipping`, `contact`, etc. 404 if unknown.
- **`GET /makes`** — `{ "data": ["Toyota", "Nissan", ...] }`.
- **`GET /body-types`** — same shape.
- **`GET /hero-slides`** — active only, ordered.
- **`GET /partners`** — active only, ordered.
- **`GET /services`** — active only, ordered.
- **`GET /process-steps`** — active only, ordered.

### 8.7 Live data

- **`GET /exchange-rate`** — see §6.4.4.
- **`GET /youtube-feed`** — see §6.4.5.

### 8.8 Shipping

- **`GET /shipping-pdf`** — 302 redirect or 404. See §6.4.6.

### 8.9 Health

- **`GET /health`** — `{ "status": "ok", "time": "..." }`.

---

## 9. Admin Panel (Filament) Resource Specification

For each Filament resource, the developer must implement at minimum the columns, filters, and form fields listed below.

### 9.1 CarResource
- **List columns:** thumbnail, make, model, year, price, source (badge), featured (toggle), status (badge), updated_at.
- **Filters:** source, status, featured, fuel, transmission, body_type, year range.
- **Form sections:**
  - *Basic*: make, model, year, price, condition, source (auto-set to `inhouse` for new manual entries; readonly for `api` cars).
  - *Specs*: mileage, fuel, transmission, body_type, engine_size, color, drive_type, seats, doors.
  - *EV/Hybrid*: battery_capacity, motor_output (visible only when fuel is `ev` or `hybrid`).
  - *Marketing*: featured toggle, badge, description (rich text or markdown).
  - *Images*: multi-upload, drag-to-reorder, mark primary.
  - *Status*: status field.
- **Bulk actions:** mark featured, mark sold, mark hidden, delete.
- **API-sourced cars**: read-only on Basic/Specs (synced from the external API). Editable: featured, badge, status, description override.

### 9.2 DeliveredCarResource
- **List columns:** image, make, model, year, customer_name, destination_country, delivery_date, status.
- **Filters:** destination_country, year, status.
- **Form:** all schema fields, image upload, optional testimonial text.

### 9.3 InquiryResource
- **List columns:** received_at, name, email, country, car (link), source, status (color-coded).
- **Filters:** status, source, date range.
- **Form:** read-only display of all submitted data; editable status and admin_notes.
- **Actions:** "Mark replied", "Mark closed", "Mark spam", "Open WhatsApp" (deep link `wa.me/<phone>` if phone present).

### 9.4 TestimonialResource
- **List columns:** status (pill), name, country, rating (stars), vehicle, created_at, featured.
- **Filters:** status, featured, rating.
- **Bulk actions:** Approve, Reject, Mark featured.
- **Form:** all fields editable; email visible to admin only.

### 9.5 PageContentResource
- One row per slug. Form: title, body (markdown editor), meta_title, meta_description, slug-specific extras.
- For `shipping`: includes PDF upload field (writes to settings or page extras).

### 9.6 HeroSlideResource, PartnerResource, ServiceResource, ProcessStepResource
- Each: simple list with sort_order drag-handle reorder, active toggle, image/icon upload, basic form.

### 9.7 SettingsResource
- Use [Filament Spatie Settings plugin](https://filamentphp.com/plugins/filament-spatie-settings) OR a custom Filament page with grouped key-value editing. Pick whichever the developer is more comfortable maintaining. Group settings by their `group` column.

---

## 10. Frontend Integration Changes (React Repo)

Changes are scoped strictly to data-loading, not layout or styling.

### 10.1 New
- `src/api/client.js` and the wrappers listed in §6.5.2.
- `src/hooks/useApi.js` — generic `useApi(fetcher, deps)` hook returning `{ data, loading, error, refetch }`.
- `src/components/Loading.jsx` and `src/components/ErrorState.jsx` — minimal, styled with existing CSS variables.
- `src/pages/NotFoundPage.jsx` — 404 component, registered as the `App.jsx` catch-all route.

### 10.2 Modified
- `src/main.jsx` / `src/App.jsx` — register `/404` and catch-all.
- `src/pages/HomePage.jsx` — replace static imports with API calls.
- `src/pages/StockListPage.jsx` — drive list and facets from API.
- `src/pages/SingleCarPage.jsx` — fetch by `id` param.
- `src/pages/AboutPage.jsx`, `src/pages/ContactPage.jsx`, `src/pages/ShippingPage.jsx` — fetch from page content + settings.
- `src/pages/DeliveredPage.jsx` — fetch list, wire review form to `submitReview`.
- `src/components/InquiryForm.jsx` — wire to `submitInquiry`, real success/error states.
- `src/components/ExchangeRate.jsx` — fetch URL changes from `/api/exchange-rate` to `${VITE_API_BASE_URL}/exchange-rate`.
- `src/components/TestimonialSlider.jsx` — fetch via API.
- `src/components/Partners.jsx`, `src/components/ProcessSteps.jsx` — same.
- `vite.config.js` — drop the dev `/api` proxy.
- `vercel.json` — remove API passthrough; SPA rewrite remains.
- `package.json` — remove `concurrently`, `express`, `cors`, `better-sqlite3`. Drop `npm run dev:server` and `npm run dev:all` scripts.

### 10.3 Deleted
- `api/` directory (Vercel functions).
- `server/` directory (Express dev server).
- `src/data/cars.js`, `src/data/auctions.js` (if auction page is dropped — see §15), `src/data/company.js`, `src/data/testimonials.js`, `src/data/makes.js`. Keep these as the seeder source until Stage 2 is complete, then delete.

---

## 11. Environment Variables

### 11.1 Laravel `.env` (production)
```
APP_NAME=Destino
APP_ENV=production
APP_KEY=<generated>
APP_DEBUG=false
APP_URL=https://api.destinocojp.com
APP_TIMEZONE=Asia/Tokyo
APP_LOCALE=en

LOG_CHANNEL=daily
LOG_LEVEL=info

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=<hostinger-provided>
DB_USERNAME=<hostinger-provided>
DB_PASSWORD=<hostinger-provided>

BROADCAST_CONNECTION=log
CACHE_STORE=file
FILESYSTEM_DISK=public
QUEUE_CONNECTION=database
SESSION_DRIVER=file

MAIL_MAILER=smtp
MAIL_HOST=smtp.hostinger.com
MAIL_PORT=587
MAIL_USERNAME=<noreply@destino.jp or similar>
MAIL_PASSWORD=<set in hPanel>
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@destino.jp"
MAIL_FROM_NAME="Destino"
MAIL_INQUIRY_TO=export@destino.jp

EXCHANGE_RATE_API_KEY=<from exchangerate-api.com>
YOUTUBE_CHANNEL_ID=UC9r_ugFs9RL4OkeEAwztQ7g

ONE_PRICE_STOCK_API_URL=<provided by client>
ONE_PRICE_STOCK_API_KEY=<provided by client>

FRONTEND_URL=https://destinocojp.com
SANCTUM_STATEFUL_DOMAINS=destinocojp.com
```

### 11.2 React `.env.production`
```
VITE_API_BASE_URL=https://api.destinocojp.com/api/v1
VITE_BRAND_PRIMARY=#32498F
VITE_BRAND_ACCENT=#1892c2
```

---

## 12. Hostinger Deployment Guide

A condensed, ordered version follows. The full step-by-step (with screenshots) lives in `docs/deployment.md` after Stage 5.

1. In hPanel, create two websites: `destinocojp.com` (or the chosen primary domain) and `api.destinocojp.com`. Add SSL on both (auto Let's Encrypt).
2. Create a MySQL database under `api.destinocojp.com`. Note credentials.
3. SSH into the account (or use Git Deployment in hPanel). Clone the Laravel repo into the `api.destinocojp.com` directory. Symlink the Laravel `public/` to the subdomain's `public_html`, OR set the document root to the Laravel `public/` directory.
4. `composer install --no-dev --optimize-autoloader`.
5. Copy `.env.example` to `.env`, fill in values from §11.1.
6. `php artisan key:generate`.
7. `php artisan migrate --force`.
8. `php artisan db:seed --force` (one time only; idempotent seeders preferred).
9. `php artisan storage:link`.
10. `php artisan config:cache route:cache view:cache`.
11. `chmod -R 775 storage bootstrap/cache`.
12. In hPanel → Cron Jobs, add:
    `* * * * * cd /home/<user>/domains/api.destinocojp.com/<laravel-root> && php artisan schedule:run >> /dev/null 2>&1`
13. Build the React app locally: `npm run build`. Upload `dist/*` to `destinocojp.com`'s `public_html`. Add an `.htaccess` SPA-fallback rule:
    ```
    <IfModule mod_rewrite.c>
      RewriteEngine On
      RewriteRule ^index\.html$ - [L]
      RewriteCond %{REQUEST_FILENAME} !-f
      RewriteCond %{REQUEST_FILENAME} !-d
      RewriteRule . /index.html [L]
    </IfModule>
    ```
14. Visit `https://api.destinocojp.com/api/v1/health` → expect 200.
15. Visit `https://api.destinocojp.com/admin` → log in.
16. Visit `https://destinocojp.com` → site loads, all data flows through API.
17. Submit a test inquiry. Confirm receipt at `export@destino.jp`.
18. Verify daily backup is enabled at the account level.

---

## 13. Acceptance Criteria — Master Checklist

Tick this entire list before declaring the project complete.

**Foundation**
- [ ] `https://api.destinocojp.com/api/v1/health` returns 200 over HTTPS.
- [ ] Filament admin login functional in production.
- [ ] No secrets in source control.
- [ ] CORS restricted to production frontend domain.
- [ ] Cron firing every minute.

**Data & admin**
- [ ] Every static dataset previously in `src/data/*.js` is now in MySQL and visible/editable in Filament.
- [ ] Image uploads work and are accessible via public URL.
- [ ] Every entity in §9 has its Filament resource implemented to spec.
- [ ] Settings panel allows non-technical edits to phone, fax, email, address, social URLs, business hours.

**Public API**
- [ ] All endpoints in §8 live and matching spec shape.
- [ ] FilterSidebar dimensions all functional (verified by manual filter combinations).
- [ ] Pagination produces correct counts.
- [ ] 422 on invalid POST payloads.
- [ ] Rate limiting active on POST endpoints.
- [ ] Postman collection committed.

**Integrations**
- [ ] Inquiry from production frontend → email at `export@destino.jp` + customer confirmation + admin record.
- [ ] Review submission → pending state → approval → live on `/delivered`.
- [ ] `php artisan stock:sync` operational (or stub clearly marked pending API access).
- [ ] Exchange rate cached, stale fallback works.
- [ ] YouTube feed cached.
- [ ] Shipping PDF upload + serve verified.
- [ ] Queue worker processing scheduled inquiries within 1–2 minutes.

**Frontend wiring**
- [ ] No `src/data/*.js` imports in any page or component.
- [ ] All pages handle loading and error states gracefully.
- [ ] InquiryForm shows real success/failure (no longer lies on failure).
- [ ] Review submission form actually submits.
- [ ] 404 page renders for unknown routes.
- [ ] `api/` and `server/` directories deleted from frontend repo.

**Production**
- [ ] React + Laravel both live on Hostinger Cloud Startup under SSL.
- [ ] Daily backups confirmed running.
- [ ] `docs/admin-guide.md`, `docs/deployment.md`, `docs/runbook.md` delivered.

---

## 14. Out of Scope

Explicitly **not** covered by this PRD:

1. **The `/auction` page becoming a real bidding system.** The contracted real-time auction lives at `autobidjp.com`. The internal page is either dropped or reduced to a static showcase that links out. See §15.
2. **Multi-language support.** English only.
3. **Customer accounts / login on the public site.** No registration, no profiles. The "Login" button in the header continues to deep-link to `app.destinoexport.com`.
4. **Payment processing.** None.
5. **SEO beyond basic meta tags.** No sitemap automation, no schema.org markup, no structured data — unless added in a follow-up phase.
6. **Analytics integration.** Add Google Tag Manager or Plausible later if requested.
7. **Two-factor auth on admin.** Filament defaults are accepted.
8. **Custom CDN beyond Hostinger's bundled CDN.** Cloudflare or Bunny.net are post-launch decisions.
9. **Performance/load testing.** Smoke and manual QA only.
10. **Mobile apps.**

---

## 15. Open Questions / Inputs Required from Client

Before Stage 4 begins, the developer must obtain from the client:

1. **One-Price Stock API documentation.** Endpoint URL, auth scheme, request/response shapes, pagination behavior, rate limits, sandbox if any. Without this, the `stock:sync` command is a placeholder.
2. **SMTP credentials.** Either Hostinger mailbox creds for `noreply@destino.jp` (or similar), or third-party SMTP (Postmark/Resend/SES) credentials. Decide where confirmation emails appear to come from.
3. **Real partner logos.** Currently every partner uses the DESTINO logo as a placeholder. Need actual logo files (or licensed source) for the 10 partners listed in `src/data/`.
4. **Real social URLs.** The values in `src/data/company.js` are `"#"`. Need final Facebook, Instagram, YouTube, LinkedIn, X URLs.
5. **Decision on `/auction` page.** Three options:
   - (a) Keep as a static "managed showcase" of upcoming/closed lots, editable from admin → adds an `auction_lots` table and a Filament resource.
   - (b) Replace the page with a hero block linking out to `autobidjp.com`.
   - (c) Remove the page from navigation entirely.
   Default if no decision is given by start of Stage 5: option (b).
6. **Domain choice.** The codebase references both `destinocojp.com` and `destino.jp`. Confirm the canonical apex domain. Confirm subdomain `api.<that>` is available for Laravel.
7. **Email recipient for new pending reviews.** Default `export@destino.jp`; confirm or override.
8. **Photography for in-house cars.** Currently Unsplash placeholders. Real product photography is the eventual replacement, but during this phase the placeholders can remain in place if a content team isn't ready.

A blocked item under §15 must not silently halt the developer. The developer is to log the blocker in `docs/runbook.md`, continue with the rest of the work, and surface the blocker at the next progress update (per §8.3.2 of the original Service Agreement: WhatsApp updates every two days).

---

## Document History

| Version | Date | Notes |
|---|---|---|
| 1.0 | 2026-05-09 | Initial PRD covering remaining backend, admin, integration, and deployment work after frontend completion. |
