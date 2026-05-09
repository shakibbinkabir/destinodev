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
