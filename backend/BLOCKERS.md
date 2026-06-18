# Blockers

Track items that need a human (usually the client) before the next stage can proceed. Append entries; do not edit history.

Format per entry:

```
## YYYY-MM-DD — short title
**Stage:** N
**Owner:** who needs to provide the answer
**What we need:** the missing input
**Impact if not resolved:** what gets stubbed or skipped
```

---

## 2026-05-09 — Replace Unsplash placeholders with real photography
**Stage:** 2
**Owner:** Client (content team)
**What we need:** Photography for the 22 in-house and API-source cars in `src/data/cars.js` and the 12 delivered cars in `src/data/company.js`. Image URLs are currently absolute Unsplash CDN links seeded into `car_images.path` and `delivered_cars.image_path`; we never download or rehost them.
**Impact if not resolved:** The public site still renders the placeholder images on the hostinger domain via the API. Storage usage stays at zero, but the catalog never reflects the real fleet. Stage 4's `stock:sync` will overwrite the API-source images, so the urgency is mostly for the 9 in-house cars.

## 2026-05-09 — Page copy migration from JSX into DB
**Stage:** 2
**Owner:** Client / copywriter
**What we need:** Final marketing copy for the about / shipping / contact pages. We seeded what exists in `src/pages/AboutPage.jsx` plus a short shipping summary and a placeholder for contact, but the React About/Contact pages also rely on dynamic settings (`company.address`, `phone`, etc.) for the bulk of their content. The shipping page in particular is presently a PDF iframe + link cards; the markdown body we seeded is a fallback.
**Impact if not resolved:** Public pages will read the seeded text. It is on-brand and accurate, but not necessarily what the client wants to ship in production.

## 2026-05-09 — Real partner logos
**Stage:** 2
**Owner:** Client
**What we need:** Logo files (SVG or high-res PNG) and final URLs for the 10 partners listed in `src/components/Partners.jsx`. Currently every partner row points to `/logo-link.png` (the DESTINO logo placeholder).
**Impact if not resolved:** The partners strip on the homepage and About page renders the same DESTINO logo for every entry. This is a UX bug visible to every site visitor, but not a blocker for the data pipeline.

## 2026-05-09 — Real social media URLs
**Stage:** 2
**Owner:** Client
**What we need:** Final Facebook, Instagram, YouTube, LinkedIn, X URLs. The seeded `social.*` settings store empty strings (the React source had `"#"` placeholders).
**Impact if not resolved:** The header/footer social icons link to nothing useful. The frontend should hide icons whose URL is empty; if it does not, the change is small.

## 2026-05-09 — YouTube channel ID returns 404
**Stage:** 4
**Owner:** Client
**What we need:** The correct YouTube channel ID for Destino. The PRD §11 and `.env.example` set `YOUTUBE_CHANNEL_ID=UC9r_ugFs9RL4OkeEAwztQ7g`, but `https://www.youtube.com/feeds/videos.xml?channel_id=UC9r_ugFs9RL4OkeEAwztQ7g` returns HTTP 404 from YouTube on 2026-05-09. The proxy endpoint (`/api/v1/youtube-feed`) is wired correctly and gracefully falls back to last_known on failure; with no last_known cached value the endpoint returns 503 to the public client.
**Impact if not resolved:** The homepage YouTube section will fall back to its empty/error state on the React side. No code changes are required to fix once the correct channel ID lands — only a env update + cache flush.

## 2026-05-09 — One-Price Stock API documentation pending
**Stage:** 4
**Owner:** Client / vendor (One-Price Stock)
**What we need:** Endpoint URL, auth scheme, request/response shapes, pagination behaviour, rate limits, and (if any) sandbox credentials for the One-Price Stock listings API. Per PRD §15 this was supposed to land before Stage 4 began.
**Impact if not resolved:** `App\Services\OnePriceStockService` is implemented against a documented STUB shape (see the class docblock); `php artisan stock:sync` short-circuits to a logged warning + exit 0 while `ONE_PRICE_STOCK_API_URL` / `ONE_PRICE_STOCK_API_KEY` remain `CHANGE_ME_*` placeholders, so the scheduler does not spam errors. When the real shape arrives, update `OnePriceStockService::normalize()` AND this entry in lockstep — do not edit the schema to fit the API.

Assumed item shape (mirrors PRD §7.1 column names):

```
{
  "id":              string  // → cars.external_id
  "make":            string,
  "model":           string,
  "year":            int,
  "price_jpy":       number,
  "mileage_km":      int,
  "fuel":            "gasoline" | "hybrid" | "ev" | "diesel",
  "transmission":    "automatic" | "manual" | "cvt",
  "body_type":       string,
  "color":           string,
  "drive_type":      "2wd" | "4wd" | "awd" | "fwd" | "rwd",
  "engine_size":     string?,
  "seats":           int,
  "doors":           int,
  "condition":       string,
  "battery_capacity": string?,
  "motor_output":    string?,
  "description":     string,
  "image_urls":      string[]
}
```

Assumed transport: bearer-token auth in the `Authorization` header (`Http::withToken(...)`), and either a flat list or one wrapped under `data` / `items` / `results`.

**RESOLVED 2026-05-20.** Vendor delivered `JDM One Price API Doc.pdf` plus three reference SQL dumps (maker / car_model / chassis_code). The real surface is two GET endpoints under `https://jdmauction.live/oneprice/api/` — `search-auction` and `lot-detail` — authed with two custom headers, `username` + `api-key` (NOT bearer). Search is per-(maker, model) only; there is no "fetch all" call, so `OnePriceStockService::iterateLots()` walks the vendor's pagination envelope (`auctionData[]`, `totalPages`, `currentPage` 0-indexed) for one pair at a time, and `StockSync` iterates an env allowlist `ONE_PRICE_STOCK_MAKERS` (CSV of maker.company_id values) crossed with each maker's distinct `model_name_ref` list. Reference data lives at `database/data/oneprice/{makers,car-models,chassis-codes}.json` (regenerate via `php scripts/build-oneprice-lookups.php` whenever the vendor updates the dumps). Sold-marking is scoped to the (make, model) pairs visited in the current run so partial syncs cannot mark unrelated catalog rows as sold. Two columns added to `cars` in migration `2026_05_20_120000_add_oneprice_provenance_to_cars`: `lot_bid` (required by lot-detail), `chassis_code`, `auction_house`, `auction_grade`. CLI overrides for ad-hoc fetches: `--maker=`, `--model=`, `--max-pages=`, `--dry-run`. Live sync confirmed `2026-05-20`: `php artisan stock:sync --maker=9 --model=718 --max-pages=1` ingested 50 Toyota Prius lots correctly normalized (1.8L hybrid, ZVW50/ZVW51 chassis, Ippatsu Stock provenance, 3 images each).

## 2026-06-10 — Exchange-rate source switched to MUFG (PRD §6.4.4 deviation)
**Stage:** post-launch change request
**Owner:** Client (decision) / dev (implementation, done)
**What changed:** Per client instruction, USD→JPY is now scraped from MUFG Bank's published TT-rate page (`EXCHANGE_RATE_MUFG_URL`) and computed as `rate = USD T.T.B. − EXCHANGE_RATE_TTB_OFFSET` (offset default ¥4), refreshed every 3 hours by the `exchange-rate:sync` scheduled command. This replaces the PRD §6.4.4 design (exchangerate-api.com, 12 h cache, `EXCHANGE_RATE_API_KEY`). The `/api/v1/exchange-rate` response shape and the cache/stale-fallback contract are unchanged.
**Risk / impact:**
- **Scraping fragility.** A MUFG layout change or bot-block would break `ExchangeRateService::parse()`. Mitigated by the last-known stale fallback (the public endpoint keeps serving the previous rate) and the ability to re-run `php artisan exchange-rate:sync` after a fix. `parse()` is unit-tested and reads the T.T.B. column positionally so dash-padded rows don't misalign.
- **Unconfirmed windows.** MUFG publishes `----` for USD outside its update windows (nights/weekends). `parse()` throws on `----`, so the rate simply stays at last-known until the next confirmed publication — by design, not an error.

## 2026-06-10 — Car prices are USD; verify legacy in-house rows
**Stage:** post-launch change request
**Owner:** Client / operator
**What we need:** A review of every **in-house** car's price. The `cars.price_jpy` column actually stores the **USD** base price (the One-Price sync writes USD `startPriceNum`; the customer Yen price is now computed client-side from the MUFG rate). The Filament field was previously mislabelled "Price (JPY) ¥" and is now "Price (USD) $". Any in-house car whose price was typed as **yen** under the old label will display as a wildly inflated Yen amount after conversion.
**Impact if not resolved:** Affected in-house listings show incorrect (huge) prices. No automatic conversion was applied — we can't reliably tell which rows were entered in yen vs USD. API-source rows are unaffected (always USD). Column not renamed to `price_usd` to avoid a data migration; the misnomer is documented in `CarResource` and `ExchangeRateService`.

## 2026-05-09 — AuctionPage final disposition
**Stage:** 5
**Owner:** Client
**What we need:** A decision on the `/auction` page per PRD §15: (a) keep as a static "managed showcase" of upcoming/closed lots editable from admin (adds an `auction_lots` table + Filament resource), (b) replace with a hero block linking out to autobidjp.com, or (c) drop from navigation entirely.
**Impact if not resolved:** Stage 5 left the page on its existing static `src/data/auctions.js` data and added a banner reading "Auctions are managed at autobidjp.com — click to view live lots". `src/data/auctions.js` was not deleted because `src/pages/AuctionPage.jsx` still imports it. The bid-placing UI on the page is still visually live but doesn't talk to anything; clicking "Place Bid" only updates local state. Options (b) and (c) are clean follow-ups that touch only the React repo; option (a) would require backend work.

