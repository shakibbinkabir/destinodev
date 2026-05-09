# Destino Admin Guide

This guide is for the person editing the Destino website day-to-day. You don't need to be technical — every routine task lives in the **Filament admin panel** at:

```
https://api.destino-v.com/admin
```

Log in with the credentials your developer set up. If you forget your password, use the "Forgot password?" link or ask the developer to reset it.

The site itself (https://destino-v.com) is a published view of what's in the admin. Most changes appear within a few seconds; some (settings, page content) may take up to 5 minutes due to caching.

---

## 1. Adding a new car (in-house)

1. **Cars** → **+ New** in the left sidebar.
2. Fill out the **Basic** section: Make, Model, Year, Price (in JPY), Condition.
3. **Specs**: Mileage (km), Fuel type, Transmission, Body type, Engine size, Color, Drive type, Seats, Doors.
4. If the car is electric or hybrid, the **EV/Hybrid** section will appear — fill in Battery Capacity and Motor Output.
5. **Marketing**: Toggle **Featured** if you want this car on the homepage. Add a **Badge** ("New Arrival", "Hot Deal", etc.) if you want a label on the card. Write a sales description.
6. **Images**: Drag photos in. Mark one as primary; reorder by dragging.
7. **Status**: Leave on **Available**. Set to **Sold** when the car is gone, **Hidden** if you want to take it offline temporarily.
8. **Save**.

The car appears immediately on `/stock`. If it's marked Featured it also shows up on the homepage in the Featured Vehicles strip.

> API-sourced cars are synced hourly from the One-Price Stock feed. You can edit their **Featured**, **Badge**, **Status**, and **Description** on the admin, but the make/model/year/price come from the feed and shouldn't be edited manually.

---

## 2. Editing settings (phone, address, social URLs, etc.)

The **Settings** page in the admin sidebar has every site-wide piece of text:

- `company.name`, `company.email`, `company.phone`, `company.fax`
- `company.address`, `company.business_hours`, `company.representative`
- `company.whatsapp_url` (used by the WhatsApp buttons site-wide)
- `social.facebook`, `social.instagram`, `social.youtube`, `social.linkedin`, `social.x`
- `seo.default_meta_title`, `seo.default_meta_description`
- `integrations.youtube_channel_id`

Change the **Value** field, save. Settings are cached for 5 minutes; refresh the public site after that to see the change.

---

## 3. Approving or rejecting a customer review

When a customer submits a review on `/delivered`, you get an email at `export@destino.jp` and the review appears in **Testimonials** with status **Pending**.

1. **Testimonials** in the sidebar.
2. Filter by **Status: Pending** to see only what needs attention.
3. Open a review. Read it. If it's good, click **Approve** (or use the bulk action if you have several at once).
4. To feature a review on the homepage rotator, toggle **Featured**.
5. To reject spam or inappropriate content, click **Reject** — the testimonial stays in the database but never goes public.

Approved + Featured testimonials show on the homepage. Approved (any) testimonials show on `/delivered` if you also fill in matching delivery data.

---

## 4. Managing inquiries

When someone fills the Contact form or the Quick Inquiry on a car page, two things happen:
1. An email lands at `export@destino.jp`.
2. A row is added to **Inquiries** in the admin.

Inquiry workflow:
1. Open the **Inquiries** list. Filter by **Status: New**.
2. Click an inquiry. You see the customer's name, email, phone, country, message, and which car/page they came from.
3. Reply to them via your email client. Then come back to the admin.
4. Use the row actions: **Mark replied**, **Mark closed**, or **Mark spam**. Add internal notes in **Admin notes**.
5. **Open WhatsApp** is a one-click button if the customer left a phone number — it opens a chat window pre-filled with their number.

---

## 5. Uploading the shipping PDF

The `/shipping` page on the public site shows a PDF in an embedded viewer. To replace it:

1. **Page Contents** → open the **shipping** row.
2. Scroll to the **Shipping PDF** upload field.
3. Click the upload area, select your new PDF (max 20 MB recommended).
4. Save.

The next visitor to `/shipping` will see the new PDF. You can swap it as often as you like; only the latest version is shown.

---

## 6. Editing page copy (About, Shipping, Contact)

1. **Page Contents** in the sidebar.
2. Pick the slug: `about`, `shipping`, or `contact`.
3. Edit **Title** and **Body** (markdown is supported — use `**bold**`, `_italic_`, `[link text](url)`).
4. **Meta title** and **Meta description** are for search-engine listings; safe defaults are seeded.
5. Save.

Page content is cached briefly. Allow 1–2 minutes for changes to appear publicly.

---

## 7. Updating partner logos & process steps

- **Partners** → upload a logo (PNG or SVG), set the partner's name and an optional URL. Drag rows to reorder. Toggle **Active** off to hide a partner without deleting them.
- **Process Steps** → the four-step "How It Works" strip on the homepage and About page. Each step has a title, description, and an icon name (a [Lucide](https://lucide.dev/icons/) icon name like `Search`, `Ship`, `ClipboardCheck`, `ThumbsUp`). Reorder by dragging.
- **Services** → the six-card grid on the About page. Same shape: title, description, icon name. Reorder by dragging.

Available icon names (the public site only renders icons from this curated list):
`Search, ClipboardCheck, Ship, ThumbsUp, ShoppingCart, FileText, Headphones, Award, Car, Shield, ShieldCheck, Globe, DollarSign, UserCheck, Users, Package, Truck, Wrench, Compass, MapPin, Phone, Mail, Calendar, TrendingUp, Star, Settings, Cog, Fuel, Gauge, Zap, Battery, Clock`.

If you enter an icon name not in this list, the public site falls back to a generic circle. Ask the developer to add it to the registry if you need a different icon.

---

## 8. Hero slides

The **Hero Slides** resource controls the rotating images at the top of the homepage. Each slide has:
- An image (1600 × 900 recommended).
- A title and subtitle (currently the homepage uses the same hero title for all slides — slide-specific titles ship in a follow-up).
- An optional CTA button (text + URL).
- A **Sort order** number and an **Active** toggle.

Add 3–5 slides. Toggle `Active` off to take a slide out of rotation without deleting it.

---

## 9. Delivered cars (Happy Customers page)

Each delivered car is a record in **Delivered Cars**. Fill in:
- Make, Model, Year.
- Customer name (first name + initial is the convention; full names are optional).
- Destination country and (optionally) city.
- Delivery date.
- An optional testimonial quote — distinct from the formal customer review system. This appears on the card itself.
- One photo of the delivered vehicle.
- Status: **Published** = visible on `/delivered`, **Hidden** = staff-only.

---

## 10. What you can't change from the admin

These are intentionally code-controlled — ping the developer if you need them changed:
- Site colors and typography.
- The header / footer / navigation menu structure.
- The auction page (currently a static showcase pointing to autobidjp.com).
- The Group Companies section in the footer.
- Country lists in the inquiry form dropdown.

---

## Got stuck?

- **Forgot password** → use the panel's "Forgot password?" link, or ask the developer.
- **A change isn't appearing on the public site** → wait 5 minutes (settings/page cache). Then do a hard refresh (`Ctrl+Shift+R` / `Cmd+Shift+R`). If still missing, see `docs/runbook.md`.
- **Something looks broken** → take a screenshot, note the URL and what you did, send it to the developer. Don't try to fix it from the admin — most "broken" UI is actually a hosting issue, not a content one.
