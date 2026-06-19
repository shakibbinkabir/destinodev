# Tickketo — Motion Graphics Promo (Remotion)

A 15-second vertical (1080×1920, 30fps) animated promo for **Tickketo**, the
live-events ticketing platform. Built with [Remotion](https://remotion.dev).
All brand tokens (crimson `#C20032` on ink `#0E0E0E`, the white→pink→crimson
logo gradient, Inter display type, the live-ticket motif and ৳ pricing) are
lifted straight from the Tickketo website so the video reads as the same
product.

## Storyboard

| # | Scene | Beat |
|---|-------|------|
| 1 | Intro | Logo mark draws on, "Tickketo" wordmark light-sweep reveal |
| 2 | Tagline | `THE best / SEATS — ONE / TAP AWAY.` with floating shapes |
| 3 | Flow | `Swipe it.` (card deck + SAVE stamp) → `Book it.` (ticket tiers) → `Hold it.` (live QR ticket) → `Live it.` (✓ YOU'RE IN) |
| 4 | Stats | Count-ups: 2.4M+ tickets · 180+ venues · 32 cities · 4.9★ |
| 5 | CTA | Crimson `GET TICKETS` card + "Find it, book it, live it." |

Timings live in `src/Tickketo.tsx` (`SCENES` / `TRANSITION`).

## Project layout

```
src/
  index.ts            registerRoot
  Root.tsx            <Composition id="Tickketo" .../>
  Tickketo.tsx        master TransitionSeries (scene order + transitions)
  theme.ts            brand color/easing/font tokens
  loadFonts.ts        self-hosted Inter loader (see Fonts note below)
  components/         LogoMark, QrCode, InkBackground, FloatShape, TicketCard
  scenes/            Scene01..Scene05
public/fonts/         Inter woff2 (400/500/700/800 + italics)
```

## Develop

```bash
npm install
npm run dev      # opens Remotion Studio
```

## Render

```bash
npm run render   # -> out/tickketo.mp4
```

### Rendering behind a restricted-egress environment

This was authored in a sandbox where only the npm registry was reachable —
Remotion's Chrome-Headless-Shell download host and Google Fonts were both
blocked. Two workarounds are baked in so it renders without external network:

1. **Fonts are self-hosted.** Inter `.woff2` files (from `@fontsource/inter`)
   are committed under `public/fonts/` and registered via `@remotion/fonts`
   in `src/loadFonts.ts` — no call to `fonts.gstatic.com`.

2. **Chromium comes from npm.** `@sparticuz/chromium` ships a Chromium binary
   inside its tarball. Extract it and point Remotion at it:

   ```bash
   node -e "require('@sparticuz/chromium').default.executablePath().then(p=>console.log(p))"
   # -> /tmp/chromium  (also unpacks SwiftShader GL libs into /tmp)

   LD_LIBRARY_PATH=/tmp:$LD_LIBRARY_PATH \
   npx remotion render Tickketo out/tickketo.mp4 \
     --browser-executable=/tmp/chromium --gl=swangle --concurrency=4
   ```

On a normal machine you can skip both and just run `npm run render`; Remotion
will download its own Chrome and Google Fonts work over the network.
