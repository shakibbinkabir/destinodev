# Brand logos

Drop manufacturer logo files here to make them appear in the country-grouped
**Browse by Brand** grid (Stock List + Home page).

## How it works

- Files are auto-discovered at build time (`src/lib/brandLogos.js` via
  `import.meta.glob`). Just add a file and rebuild — no code change needed.
- Name each file after the brand **slug** from
  `src/data/brandCatalog.js`, with any of these extensions:
  `.svg` (preferred), `.png`, `.webp`, `.jpg`, `.jpeg`.
- A brand with **no** logo file here renders as a clean text wordmark instead,
  so the grid always looks complete.

## Expected filenames (slugs)

```
toyota        lexus         nissan        honda         mazda
subaru        mitsubishi    suzuki        daihatsu
mercedes-benz bmw           porsche       audi          volkswagen
smart         opel
ferrari       lamborghini   maserati      alfa-romeo    fiat       abarth
land-rover    jaguar        mini          aston-martin  bentley
rolls-royce   lotus         mclaren
renault       peugeot       citroen       ds
ford          chevrolet     jeep          cadillac      dodge      tesla
volvo         hyundai       kia
```

Example: `bmw.svg`, `mercedes-benz.png`, `alfa-romeo.svg`.

> Logos are trademarks of their respective manufacturers. Use only artwork you
> are licensed to display. Prefer transparent SVG/PNG, roughly square, ~64px+.
