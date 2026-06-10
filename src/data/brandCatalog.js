/**
 * Curated car-brand catalogue, grouped by country of origin, used by the
 * country-grouped brand browser (see src/components/BrandGrid.jsx).
 *
 * This is a static superset of the brands Destino may carry. The grid renders
 * every brand here; a brand is only clickable when it matches a make that is
 * actually in stock (the live /api/v1/makes list). Out-of-stock brands are
 * shown greyed-out and non-interactive.
 *
 * `slug` is the lookup key for the optional logo file in
 * src/assets/brand-logos/<slug>.{svg,png,webp,jpg} (see src/lib/brandLogos.js).
 * `flag` is a Unicode regional-indicator emoji — no image assets required.
 *
 * Matching against in-stock makes is done on a normalised key (lowercased,
 * alphanumerics only) so "Mercedes-Benz", "Mercedes Benz" and "mercedesbenz"
 * all line up. See normalizeMake() below.
 */

export const BRAND_CATALOG = [
  {
    country: 'Japan',
    flag: '🇯🇵',
    brands: [
      { name: 'Toyota', slug: 'toyota' },
      { name: 'Lexus', slug: 'lexus' },
      { name: 'Nissan', slug: 'nissan' },
      { name: 'Infiniti', slug: 'infiniti' },
      { name: 'Honda', slug: 'honda' },
      { name: 'Acura', slug: 'acura' },
      { name: 'Mazda', slug: 'mazda' },
      { name: 'Subaru', slug: 'subaru' },
      { name: 'Mitsubishi', slug: 'mitsubishi' },
      { name: 'Suzuki', slug: 'suzuki' },
      { name: 'Daihatsu', slug: 'daihatsu' },
      { name: 'Isuzu', slug: 'isuzu' },
      { name: 'Datsun', slug: 'datsun' },
      { name: 'Mitsuoka', slug: 'mitsuoka' },
    ],
  },
  {
    country: 'Germany',
    flag: '🇩🇪',
    brands: [
      { name: 'Mercedes-Benz', slug: 'mercedes-benz' },
      { name: 'BMW', slug: 'bmw' },
      { name: 'Porsche', slug: 'porsche' },
      { name: 'Audi', slug: 'audi' },
      { name: 'Volkswagen', slug: 'volkswagen' },
      { name: 'Smart', slug: 'smart' },
      { name: 'Opel', slug: 'opel' },
    ],
  },
  {
    country: 'Italy',
    flag: '🇮🇹',
    brands: [
      { name: 'Ferrari', slug: 'ferrari' },
      { name: 'Lamborghini', slug: 'lamborghini' },
      { name: 'Maserati', slug: 'maserati' },
      { name: 'Alfa Romeo', slug: 'alfa-romeo' },
      { name: 'Fiat', slug: 'fiat' },
      { name: 'Abarth', slug: 'abarth' },
    ],
  },
  {
    country: 'United Kingdom',
    flag: '🇬🇧',
    brands: [
      { name: 'Land Rover', slug: 'land-rover' },
      { name: 'Jaguar', slug: 'jaguar' },
      { name: 'MINI', slug: 'mini' },
      { name: 'Aston Martin', slug: 'aston-martin' },
      { name: 'Bentley', slug: 'bentley' },
      { name: 'Rolls-Royce', slug: 'rolls-royce' },
      { name: 'Lotus', slug: 'lotus' },
      { name: 'McLaren', slug: 'mclaren' },
    ],
  },
  {
    country: 'France',
    flag: '🇫🇷',
    brands: [
      { name: 'Renault', slug: 'renault' },
      { name: 'Peugeot', slug: 'peugeot' },
      { name: 'Citroën', slug: 'citroen' },
      { name: 'DS', slug: 'ds' },
    ],
  },
  {
    country: 'United States',
    flag: '🇺🇸',
    brands: [
      { name: 'Ford', slug: 'ford' },
      { name: 'Chevrolet', slug: 'chevrolet' },
      { name: 'Jeep', slug: 'jeep' },
      { name: 'Cadillac', slug: 'cadillac' },
      { name: 'Dodge', slug: 'dodge' },
      { name: 'Tesla', slug: 'tesla' },
    ],
  },
  {
    country: 'Sweden',
    flag: '🇸🇪',
    brands: [
      { name: 'Volvo', slug: 'volvo' },
    ],
  },
  {
    country: 'South Korea',
    flag: '🇰🇷',
    brands: [
      { name: 'Hyundai', slug: 'hyundai' },
      { name: 'Kia', slug: 'kia' },
    ],
  },
];

/** Normalise a make/brand name for matching: lowercase, alphanumerics only. */
export function normalizeMake(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]/g, '');
}

/** Every brand name that appears anywhere in the catalogue (normalised set). */
export const CATALOG_KEYS = new Set(
  BRAND_CATALOG.flatMap((g) => g.brands.map((b) => normalizeMake(b.name))),
);
