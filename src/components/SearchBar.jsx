import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { makes, bodyTypes, yearRange } from '../data/makes';
import './SearchBar.css';

export default function SearchBar() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    make: '',
    bodyType: '',
    yearFrom: '',
    priceRange: '',
    transmission: '',
  });

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    navigate(`/stock?${params.toString()}`);
  };

  const years = [];
  for (let y = yearRange.max; y >= yearRange.min; y--) {
    years.push(y);
  }

  return (
    <div className="search-bar">
      <div className="search-bar__inner">
        <div className="search-bar__fields">
          <div className="search-bar__field">
            <label className="search-bar__label">Make</label>
            <select name="make" value={filters.make} onChange={handleChange} className="search-bar__select">
              <option value="">All Makes</option>
              {makes.map((m) => (
                <option key={m.name} value={m.name}>{m.name}</option>
              ))}
            </select>
          </div>

          <div className="search-bar__field">
            <label className="search-bar__label">Body Type</label>
            <select name="bodyType" value={filters.bodyType} onChange={handleChange} className="search-bar__select">
              <option value="">All Types</option>
              {bodyTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="search-bar__field">
            <label className="search-bar__label">Year</label>
            <select name="yearFrom" value={filters.yearFrom} onChange={handleChange} className="search-bar__select">
              <option value="">Any Year</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}+</option>
              ))}
            </select>
          </div>

          <div className="search-bar__field">
            <label className="search-bar__label">Price Range</label>
            <select name="priceRange" value={filters.priceRange} onChange={handleChange} className="search-bar__select">
              <option value="">Any Price</option>
              <option value="0-15000">Under $15,000</option>
              <option value="15000-30000">$15,000 – $30,000</option>
              <option value="30000-50000">$30,000 – $50,000</option>
              <option value="50000-80000">$50,000 – $80,000</option>
              <option value="80000-999999">$80,000+</option>
            </select>
          </div>

          <div className="search-bar__field">
            <label className="search-bar__label">Transmission</label>
            <select name="transmission" value={filters.transmission} onChange={handleChange} className="search-bar__select">
              <option value="">All</option>
              <option value="Automatic">Automatic</option>
              <option value="Manual">Manual</option>
            </select>
          </div>
        </div>

        <button className="search-bar__btn btn btn--primary" onClick={handleSearch}>
          <Search size={16} />
          Search
        </button>
      </div>
    </div>
  );
}
