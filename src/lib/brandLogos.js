/**
 * Resolves a brand logo to a bundled asset URL, if one exists.
 *
 * Logo files live in src/assets/brand-logos/ and are named after the brand
 * `slug` from src/data/brandCatalog.js (e.g. `bmw.svg`, `mercedes-benz.png`).
 * They are discovered at build time with Vite's import.meta.glob, so dropping a
 * new file into that folder is enough — no code change — and missing files do
 * not produce 404s (the grid falls back to a text wordmark).
 *
 * Supported extensions: svg, png, webp, jpg, jpeg.
 */

const modules = import.meta.glob(
  '../assets/brand-logos/*.{svg,png,webp,jpg,jpeg}',
  { eager: true, import: 'default' },
);

// Map bare filename (without extension) -> resolved asset URL.
const bySlug = {};
for (const [path, url] of Object.entries(modules)) {
  const file = path.split('/').pop() || '';
  const slug = file.replace(/\.[^.]+$/, '').toLowerCase();
  bySlug[slug] = url;
}

/** Returns the bundled logo URL for a brand slug, or null if none is present. */
export function getBrandLogo(slug) {
  return bySlug[String(slug || '').toLowerCase()] || null;
}
