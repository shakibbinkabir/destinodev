import { useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { makes, bodyTypes, fuelTypes, yearRange } from '../data/makes';
import './FilterSidebar.css';

export default function FilterSidebar({ filters, setFilters, onApply, onClear, isOpen, onClose }) {
  const [openSections, setOpenSections] = useState({
    make: true,
    year: true,
    price: true,
    bodyType: true,
    transmission: true,
    fuel: true,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCheckbox = (field, value) => {
    const current = filters[field] || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setFilters({ ...filters, [field]: updated });
  };

  const years = [];
  for (let y = yearRange.max; y >= yearRange.min; y--) years.push(y);

  return (
    <>
      {isOpen && <div className="filter-sidebar__overlay" onClick={onClose} />}
      <aside className={`filter-sidebar${isOpen ? ' filter-sidebar--open' : ''}`}>
        <div className="filter-sidebar__header">
          <h3 className="filter-sidebar__title">Filters</h3>
          <button className="filter-sidebar__close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="filter-sidebar__body">
          <div className="filter-sidebar__search">
            <input
              type="text"
              placeholder="Search vehicles..."
              value={filters.search || ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="filter-sidebar__input"
            />
          </div>

          <div className="filter-sidebar__source-toggle">
            {['All', 'API Stock', 'In-House'].map((s) => (
              <button
                key={s}
                className={`filter-sidebar__source-btn${(filters.sourceFilter || 'All') === s ? ' filter-sidebar__source-btn--active' : ''}`}
                onClick={() => setFilters({ ...filters, sourceFilter: s })}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="filter-sidebar__group">
            <button className="filter-sidebar__group-header" onClick={() => toggleSection('make')}>
              <span>Make</span>
              {openSections.make ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {openSections.make && (
              <div className="filter-sidebar__group-body">
                {makes.map((m) => (
                  <label key={m.name} className="filter-sidebar__checkbox">
                    <input
                      type="checkbox"
                      checked={(filters.makes || []).includes(m.name)}
                      onChange={() => handleCheckbox('makes', m.name)}
                    />
                    <span className="filter-sidebar__checkmark" />
                    <span className="filter-sidebar__checkbox-label">{m.name}</span>
                    <span className="filter-sidebar__checkbox-count">({m.count})</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="filter-sidebar__group">
            <button className="filter-sidebar__group-header" onClick={() => toggleSection('year')}>
              <span>Year Range</span>
              {openSections.year ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {openSections.year && (
              <div className="filter-sidebar__group-body filter-sidebar__range">
                <select
                  value={filters.yearFrom || ''}
                  onChange={(e) => setFilters({ ...filters, yearFrom: e.target.value })}
                  className="filter-sidebar__select"
                >
                  <option value="">From</option>
                  {years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
                <span className="filter-sidebar__range-sep">–</span>
                <select
                  value={filters.yearTo || ''}
                  onChange={(e) => setFilters({ ...filters, yearTo: e.target.value })}
                  className="filter-sidebar__select"
                >
                  <option value="">To</option>
                  {years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            )}
          </div>

          <div className="filter-sidebar__group">
            <button className="filter-sidebar__group-header" onClick={() => toggleSection('price')}>
              <span>Price Range (USD)</span>
              {openSections.price ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {openSections.price && (
              <div className="filter-sidebar__group-body filter-sidebar__range">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.priceMin || ''}
                  onChange={(e) => setFilters({ ...filters, priceMin: e.target.value })}
                  className="filter-sidebar__input filter-sidebar__input--small"
                />
                <span className="filter-sidebar__range-sep">–</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.priceMax || ''}
                  onChange={(e) => setFilters({ ...filters, priceMax: e.target.value })}
                  className="filter-sidebar__input filter-sidebar__input--small"
                />
              </div>
            )}
          </div>

          <div className="filter-sidebar__group">
            <button className="filter-sidebar__group-header" onClick={() => toggleSection('bodyType')}>
              <span>Body Type</span>
              {openSections.bodyType ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {openSections.bodyType && (
              <div className="filter-sidebar__group-body">
                {bodyTypes.map((t) => (
                  <label key={t} className="filter-sidebar__checkbox">
                    <input
                      type="checkbox"
                      checked={(filters.bodyTypes || []).includes(t)}
                      onChange={() => handleCheckbox('bodyTypes', t)}
                    />
                    <span className="filter-sidebar__checkmark" />
                    <span className="filter-sidebar__checkbox-label">{t}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="filter-sidebar__group">
            <button className="filter-sidebar__group-header" onClick={() => toggleSection('transmission')}>
              <span>Transmission</span>
              {openSections.transmission ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {openSections.transmission && (
              <div className="filter-sidebar__group-body">
                {['All', 'Automatic', 'Manual'].map((t) => (
                  <label key={t} className="filter-sidebar__radio">
                    <input
                      type="radio"
                      name="transmission"
                      checked={(filters.transmission || 'All') === t}
                      onChange={() => setFilters({ ...filters, transmission: t })}
                    />
                    <span className="filter-sidebar__radio-mark" />
                    <span className="filter-sidebar__checkbox-label">{t}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="filter-sidebar__group">
            <button className="filter-sidebar__group-header" onClick={() => toggleSection('fuel')}>
              <span>Fuel Type</span>
              {openSections.fuel ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {openSections.fuel && (
              <div className="filter-sidebar__group-body">
                {fuelTypes.map((f) => (
                  <label key={f} className="filter-sidebar__checkbox">
                    <input
                      type="checkbox"
                      checked={(filters.fuelTypes || []).includes(f)}
                      onChange={() => handleCheckbox('fuelTypes', f)}
                    />
                    <span className="filter-sidebar__checkmark" />
                    <span className="filter-sidebar__checkbox-label">{f}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="filter-sidebar__footer">
          <button className="filter-sidebar__clear" onClick={onClear}>Clear All</button>
          <button className="btn btn--primary btn--full" onClick={onApply}>Apply Filters</button>
        </div>
      </aside>
    </>
  );
}
