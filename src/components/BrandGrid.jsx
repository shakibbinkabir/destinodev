import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { getMakes } from '../api/site';
import { getBrandLogo } from '../lib/brandLogos';
import { BRAND_CATALOG, CATALOG_KEYS, normalizeMake } from '../data/brandCatalog';
import './BrandGrid.css';

/**
 * Country-grouped car-brand browser. Renders the full curated catalogue
 * (src/data/brandCatalog.js); a brand is clickable only when it matches a make
 * that is currently in stock (the live /api/v1/makes list). Out-of-stock
 * brands are greyed-out and inert.
 *
 * Two interaction modes:
 *  - Navigation (default): each in-stock brand links to /stock?make=<make>.
 *  - Filter callback: pass `onSelectMake` and brands become buttons that call
 *    it with the exact in-stock make string (used in-place on the Stock List).
 */
export default function BrandGrid({
  onSelectMake,
  selectedMake = '',
  collapsible = false,
  defaultOpen = true,
  showHeader = true,
  title = 'Browse by Brand',
}) {
  const { data: makesData } = useApi((signal) => getMakes({ signal }), []);
  const [open, setOpen] = useState(defaultOpen);

  // Map normalised brand key -> exact in-stock make string (for links/filter).
  const inStock = useMemo(() => {
    const map = new Map();
    (makesData || []).forEach((make) => {
      map.set(normalizeMake(make), make);
    });
    return map;
  }, [makesData]);

  // Any in-stock make not covered by the curated catalogue gets an "Other"
  // group so nothing in the catalogue's blind spots becomes unreachable.
  const groups = useMemo(() => {
    const others = [];
    inStock.forEach((make, key) => {
      if (!CATALOG_KEYS.has(key)) {
        others.push({ name: make, slug: normalizeMake(make) });
      }
    });
    others.sort((a, b) => a.name.localeCompare(b.name));
    return others.length
      ? [...BRAND_CATALOG, { country: 'Other', flag: '🌐', brands: others }]
      : BRAND_CATALOG;
  }, [inStock]);

  const selectedKey = normalizeMake(selectedMake);

  const renderBrand = (brand) => {
    const key = normalizeMake(brand.name);
    const make = inStock.get(key);
    const available = Boolean(make);
    const isSelected = available && key === selectedKey;
    const logo = getBrandLogo(brand.slug);

    const inner = (
      <>
        <span className="brand-grid__logo">
          {logo
            ? <img src={logo} alt={`${brand.name} logo`} loading="lazy" />
            : <span className="brand-grid__wordmark">{brand.name}</span>}
        </span>
        <span className="brand-grid__name">{brand.name}</span>
      </>
    );

    const className = `brand-grid__brand${available ? '' : ' brand-grid__brand--disabled'}${isSelected ? ' brand-grid__brand--active' : ''}`;

    if (!available) {
      return (
        <div key={brand.slug} className={className} aria-disabled="true" title="No stock currently">
          {inner}
        </div>
      );
    }

    if (onSelectMake) {
      return (
        <button
          key={brand.slug}
          type="button"
          className={className}
          onClick={() => onSelectMake(make)}
          aria-pressed={isSelected}
        >
          {inner}
        </button>
      );
    }

    return (
      <Link
        key={brand.slug}
        to={`/stock?make=${encodeURIComponent(make)}`}
        className={className}
      >
        {inner}
      </Link>
    );
  };

  const isOpen = collapsible ? open : true;

  return (
    <div className="brand-grid">
      {showHeader && (
        <div className="brand-grid__header">
          {collapsible ? (
            <button
              type="button"
              className="brand-grid__toggle"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
            >
              <span>{title}</span>
              {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          ) : (
            <h2 className="brand-grid__title">{title}</h2>
          )}
        </div>
      )}

      {isOpen && (
        <div className="brand-grid__countries">
          {groups.map((group) => (
            <div key={group.country} className="brand-grid__country">
              <h3 className="brand-grid__country-name">
                <span className="brand-grid__flag" aria-hidden="true">{group.flag}</span>
                {group.country}
              </h3>
              <div className="brand-grid__brands">
                {group.brands.map(renderBrand)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
