# DESTINO — Comprehensive Project Brief

A detailed write-up of what this codebase is, how it's structured, what's already built, what's stubbed/mock, and what's still missing.

---

## 1. What This Is

**DESTINO** is the marketing + stock-browsing website for **DESTINO Corporation**, a Yokohama-based Japanese used / premium vehicle exporter (established 1995, member of JUMVEA). The site is the public face for international buyers — lets them browse stock, view auction lots, see delivered vehicles, and contact the company for export quotes.

- **Tagline:** *"For Those Who Love Import Cars."*
- **Brand color:** `#32498F` (deep blue) with a `#1892c2` cyan accent for CTAs.
- **Markets served:** 50+ countries (Africa, Middle East, Oceania, Caribbean, SE Asia, UK/Ireland).
- **Domain referenced in code:** `destinocojp.com` / `destino.jp`.
- **Backoffice (external):** `app.destinoexport.com/login.php` (login link only — not part of this repo).
- **Auction integration (external):** `autobidjp.com/login` (linked from header — not embedded).

---

## 2. Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + React Router v6, Vite 5, plain CSS (no Tailwind / no CSS-in-JS) |
| Icons | `lucide-react` |
| Local API server (dev) | Express 4 + CORS on port 3001 |
| Local persistence | `better-sqlite3` (exchange-rate cache, WAL mode) |
| Production deploy | Vercel (per `vercel.json`) — uses serverless functions in `/api` |
| Scripts | `concurrently` runs Vite (3000) + Express (3001) together via `npm run dev` |

`vite.config.js` proxies `/api/*` → `http://localhost:3001` for development, so the same fetch URLs work in dev (Express) and production (Vercel functions).

**Note:** No TypeScript, no test framework, no linter configured.

---

## 3. Repo Layout

```
api/                     Vercel serverless functions
  exchange-rate.js       USD→JPY rate (no caching, edge-cached via headers)
  youtube-feed.js        DESTINO YouTube channel RSS parser
server/                  Local Express dev server (mirrors /api)
  index.js               Same endpoints + /api/inquiry + /api/health
  db.js                  SQLite cache (exchange_rates, 12h TTL)
  *.db                   gitignored
public/
  logo-link.png          Brand logo
src/
  main.jsx, App.jsx      Router setup, ScrollToTop
  components/            14 reusable components
  pages/                 8 route pages
  data/                  Static seed data (cars, auctions, company, testimonials, makes)
  styles/                reset, typography, utilities, variables, index
dist/                    Empty (no build artifact committed)
index.html               Root HTML
vite.config.js
vercel.json              SPA rewrite + /api passthrough
package.json
MEMORY.md                Pointer to brand_color.md (file not present in repo)
```

---

## 4. Routes & Pages (8)

| Route | Page | What it does |
|---|---|---|
| `/` | `HomePage` | Hero slider (3 images, 5s rotation), stats strip, search bar, featured vehicles (6), "Why Destino" USPs, How It Works, Partners, Recently Added (4), testimonial slider, **YouTube videos pulled live** from `/api/youtube-feed`, CTA banner |
| `/stock` | `StockListPage` | Filterable/sortable/paginated catalog (9 per page), grid + list view toggle, accepts `?make=`, `?bodyType=`, `?transmission=`, `?yearFrom=` from URL |
| `/stock/:id` | `SingleCarPage` | Image gallery, full specs, dynamic powertrain section (**EV** shows battery+motor, **Hybrid** shows engine+motor, **Gasoline** shows fuel+engine), WhatsApp deep-link inquiry button with prefilled message, share buttons (WA/FB/copy), full spec table, inquiry form, similar vehicles |
| `/about` | `AboutPage` | Company story, 6 services, process steps, company info table, locations, partners |
| `/contact` | `ContactPage` | Inquiry form + sidebar with address/phone/fax/email/WhatsApp/hours/social, Google Map embed for Yokohama HQ |
| `/delivered` | `DeliveredPage` | "Happy Customers" — filterable (year, country) grid of 12 delivered cars, stats strip, **"Write Your Review" modal** (5-star rating, name/country/vehicle/text, modal-only — not yet wired to backend) |
| `/auction` | `AuctionPage` | Live-auction-style cards with **real-time countdown timers** (re-renders every 1s), simulated bid placement (local state only), bid history dropdown, sort options, sidebar with exchange rate + how-it-works + auction houses list. Note: header links to external `autobidjp.com` — this internal `/auction` page is a UI mock. |
| `/shipping` | `ShippingPage` | Embedded PDF iframe pointing to `/api/shipping-info-pdf` (**endpoint not yet implemented**), download button, fallback UI on iframe error, links to SeaRates / Freightos / Shippio |

`ScrollToTop` in `App.jsx` resets scroll on every navigation.

---

## 5. Components (14)

**Layout / chrome**
- `Header` — Topbar (Japan clock, exchange rate, phone) + main nav with logo, 7 nav items (Home, Stock List, **Live Auction → external**, About, Happy Customers, Shipping, Contact), Login button → external app, "Get a Quote" CTA → WhatsApp, mobile hamburger with body-scroll lock.
- `Footer` — Brand block, quick links, vehicle-type shortcuts, embedded Google Map, **"Group Companies" grid** (Yokohama Showroom, Scuderia Destino service workshop, Carrozzeria Destino paint shop, Car Washing EXP, Sagittario), JUMVEA membership notice.
- `FloatingContact` — fixed contact widget.
- `PageTitle` — page header w/ breadcrumbs.

**Feature widgets**
- `JapanClock` — live Japan time (Asia/Tokyo).
- `ExchangeRate` — `compact` and `full` variants, fetches `/api/exchange-rate`, auto-refreshes every 30 min.
- `SearchBar` — homepage search.
- `FilterSidebar` — collapsible sections for make / year / price / body type / transmission / fuel + search + source toggle (All / API Stock / In-House).
- `CarCard` — listing card with badge, source pill, FOB-Japan price.
- `ImageGallery` — single-car image viewer.
- `InquiryForm` — POSTs to `/api/inquiry`, supports `carReference` prefill, shows success state (still shows success even on network error — see §8).
- `StatsStrip` — stats display (default + customizable).
- `ProcessSteps` — how-it-works steps.
- `TestimonialSlider` — reviews carousel from `data/testimonials.js`.
- `Partners` — sales partners grid (Caterham, Lotus, Morgan, Yokohama, Caterpillar, Fekema, JUMVEA, USS Auto Auction, AUCNET, MK Seiko).
- `CTABanner` — repeated bottom-of-page CTA.

---

## 6. Backend / API Endpoints

Two parallel implementations live side by side — Vercel functions in `api/` (production) and a local Express server in `server/` (development).

| Endpoint | Method | Status |
|---|---|---|
| `/api/exchange-rate` | GET | ✅ Working. Express version caches in SQLite (12h TTL), serves stale on API failure. Vercel version uses `s-maxage=3600, stale-while-revalidate=7200`. Uses `exchangerate-api.com` with hardcoded key `a463b11d7d1925a3425402ca` (⚠️ secret committed). |
| `/api/youtube-feed` | GET | ✅ Working. Parses YouTube channel RSS for channel `UC9r_ugFs9RL4OkeEAwztQ7g` — extracts videoId, title, published, thumbnail, views. Used on homepage. |
| `/api/inquiry` | POST | ⚠️ **Partial.** Express only — validates required fields, logs to console, returns success. **No email is actually sent.** Comment says "TODO: Connect to nodemailer / SendGrid / SES → `export@destino.jp`". No Vercel equivalent in `/api`. |
| `/api/health` | GET | ✅ Local only. |
| `/api/shipping-info-pdf` | GET | ❌ **Missing.** Referenced from `ShippingPage` but no handler exists. |

---

## 7. Data Model (all currently static / seed)

- **`src/data/cars.js`** — 22 vehicles. Fields: `id`, `make`, `model`, `year`, `price`, `mileage`, `fuel`, `transmission`, `bodyType`, `engineSize`, `color`, `driveType`, `seats`, `doors`, `condition`, `source` ("inhouse" | "api"), `featured`, `badge`, `images[]`, `description`. EV/Hybrid variants additionally have `batteryCapacity` / `motorOutput`.
- **`src/data/auctions.js`** — 16 auction lots with bid history, countdowns, auction-house metadata. Uses `futureDate()` / `pastDate()` helpers so timestamps stay live.
- **`src/data/company.js`** — Single source of truth for company info: address, phone (+81-45-949-6777), fax, email (`export@destino.jp`), business hours, WhatsApp link (`wa.me/81459496777`), representative (Takeshi Yamamoto), JUMVEA membership. Also exports `deliveredCars` (12 entries with destinations, dates, customer names, testimonials).
- **`src/data/testimonials.js`** — 6 customer testimonials with star ratings.
- **`src/data/makes.js`** — Filter facets (8 makes, 7 body types, 4 fuel types, year range 2019-2024).

All vehicle imagery currently uses Unsplash CDN URLs.

---

## 8. What's Done vs What's Stubbed

### ✅ Done & working
- Full responsive layout, brand styling on `#32498F`, typography, design system (CSS variables in `variables.css`).
- All 8 page routes wired up with React Router; URL params on `/stock` honored.
- Stock filtering (search + 8 dimensions), sorting (5 modes), pagination, grid/list toggle.
- Single-car page with EV/Hybrid/Gasoline-aware spec rendering and WhatsApp deep-link inquiry.
- Auction page with **live countdown timers** (1-second tick) and simulated bidding.
- Live USD→JPY exchange rate (with SQLite cache + stale fallback in dev).
- Live YouTube channel feed (RSS parsing, no API key required).
- Header topbar with Japan clock + exchange rate + click-to-call.
- Mobile menu with body-scroll lock.
- Google Maps embed in footer + on `/contact`.
- Brand assets: `logo-link.png` referenced from header/footer.
- WhatsApp integration (correct number `+81-45-949-6777` / `wa.me/81459496777`) on header CTA, single-car inquire button, contact page.
- External links: live auction (`autobidjp.com`), client portal (`app.destinoexport.com`).
- Vercel deploy config with SPA rewrite + serverless API.

### ⚠️ Stubbed / mocked
- **Inquiry form submissions** — backend logs to console only; **no email** is sent. The form claims success even when the network call fails (intentional fallback, but means real submissions go nowhere).
- **Auction bidding** — buttons increment local React state; no real bid is placed.
- **"Write Your Review" form** on `/delivered` — submits to nothing, just shows success modal.
- **Reviews** are not persisted; testimonials are static.
- **Login button** points to an external app (`app.destinoexport.com/login.php`) — no SSO or auth in this repo.
- **Vehicle / auction data** is hardcoded — no CMS, no DB-backed catalog, no admin UI.
- **Partner logos** all use the DESTINO logo as a placeholder (`/logo-link.png`) — real partner logos not yet sourced.
- **Social links** — `youtube`, `instagram`, `facebook` all set to `"#"` in `company.js` (placeholder).
- **About page** "Google Maps" cards are MapPin icons, not real embeds (only the contact / footer maps are real).

### ❌ Missing
- **`/api/shipping-info-pdf`** endpoint — `ShippingPage` references it but it's not implemented; the embedded PDF will 404.
- **Vercel-side `/api/inquiry`** — only Express has it, so production form submissions won't reach a handler.
- **Email sending** — no nodemailer/SendGrid/SES integration despite the TODO.
- **`brand_color.md`** referenced from `MEMORY.md` doesn't exist.
- **Tests / linting / CI** — none.
- **Type safety** — JS, no TS, no JSDoc.

---

## 9. Notable Risks & Gotchas

1. **Hardcoded API key** — `exchangerate-api.com` key `a463b11d7d1925a3425402ca` is committed in both `api/exchange-rate.js` and `server/index.js`. Should be moved to env vars before any wider deployment.
2. **Inquiry form lies on failure** — `InquiryForm` shows success state even when the POST fails, AND the success-on-network-success only logs to console. End users believe their inquiry was received when it wasn't.
3. **Express server won't run on Vercel** — production relies on `/api/*.js` serverless functions; the `/api/inquiry` endpoint only exists in Express, so it will 404 in production.
4. **Auction page is purely cosmetic** — bids do nothing; the real auction integration lives at `autobidjp.com` (external).
5. **Source-of-truth split** — `api/exchange-rate.js` and `server/index.js` duplicate logic; updates need to happen in both.
6. **No error boundaries / 404 route** — only `SingleCarPage` has its own not-found state; unknown routes render an empty `<main>`.

---

## 10. Recent Work (last 12 commits, newest first)

1. `f127665` Brand color docs, settings update, index.html assets, logo update
2. `b7ec6e8` Wire contact form to API endpoint + Google Map on contact page
3. `6b42523` Update sales partners (Caterham, Lotus, Morgan, Yokohama, etc.)
4. `91a1ee7` Connect WhatsApp to correct phone number
5. `5e674b5` Footer overhaul — group companies grid + Google Map
6. `607aa9a` Dynamic EV/Hybrid/Gasoline specs + WhatsApp inquiry
7. `83e76eb` Rename "Delivered Cars" → "Happy Customers" + Write Your Review
8. `7dbfce8` Add Shipping Information page with PDF viewer
9. `5f2aff2` Rebrand to `#32498F`, dynamic YouTube feed, partners, fix images
10. `54715b7` Exchange rate API handler + config
11. `71aaa0b` ExchangeRate + JapanClock components, auction structure, AuctionPage
12. `36214fe` SingleCarPage + StockListPage components

The trajectory is: **scaffolding → core pages → auctions/exchange → branding pass → wiring real-world contact details (WhatsApp, partners) → contact form to API**. Next logical commits would be: implement email sending, implement shipping PDF endpoint, replace Unsplash imagery, move API key to env, add real partner logos, populate social links.

---

## 11. Current Branch State

- **On branch:** `claude/comprehensive-documentation-brief-rQ4Ax` (matches the assigned dev branch).
- **Working tree:** clean — no uncommitted changes.
- **Default branch:** `main`.

If you want this brief committed as a `BRIEF.md` (or similar) on the branch, say the word and I'll add it.