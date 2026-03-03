import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, LayoutGrid, List, ChevronLeft, ChevronRight } from 'lucide-react';
import PageTitle from '../components/PageTitle';
import FilterSidebar from '../components/FilterSidebar';
import CarCard from '../components/CarCard';
import CTABanner from '../components/CTABanner';
import { cars } from '../data/cars';
import './StockListPage.css';

const ITEMS_PER_PAGE = 9;

export default function StockListPage() {
  const [searchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);

  const initialFilters = {
    search: '',
    makes: searchParams.get('make') ? [searchParams.get('make')] : [],
    yearFrom: searchParams.get('yearFrom') || '',
    yearTo: '',
    priceMin: '',
    priceMax: '',
    bodyTypes: searchParams.get('bodyType') ? [searchParams.get('bodyType')] : [],
    transmission: searchParams.get('transmission') || 'All',
    fuelTypes: [],
    sourceFilter: 'All',
  };

  const [filters, setFilters] = useState(initialFilters);

  const filteredCars = useMemo(() => {
    let result = [...cars];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (c) =>
          c.make.toLowerCase().includes(q) ||
          c.model.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      );
    }

    if (filters.makes.length > 0) {
      result = result.filter((c) => filters.makes.includes(c.make));
    }

    if (filters.yearFrom) {
      result = result.filter((c) => c.year >= parseInt(filters.yearFrom));
    }

    if (filters.yearTo) {
      result = result.filter((c) => c.year <= parseInt(filters.yearTo));
    }

    if (filters.priceMin) {
      result = result.filter((c) => c.price >= parseInt(filters.priceMin));
    }

    if (filters.priceMax) {
      result = result.filter((c) => c.price <= parseInt(filters.priceMax));
    }

    if (filters.bodyTypes.length > 0) {
      result = result.filter((c) => filters.bodyTypes.includes(c.bodyType));
    }

    if (filters.transmission && filters.transmission !== 'All') {
      result = result.filter((c) => c.transmission === filters.transmission);
    }

    if (filters.fuelTypes.length > 0) {
      result = result.filter((c) => filters.fuelTypes.includes(c.fuel));
    }

    if (filters.sourceFilter === 'API Stock') {
      result = result.filter((c) => c.source === 'api');
    } else if (filters.sourceFilter === 'In-House') {
      result = result.filter((c) => c.source === 'inhouse');
    }

    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'year-new':
        result.sort((a, b) => b.year - a.year);
        break;
      case 'mileage-low':
        result.sort((a, b) => a.mileage - b.mileage);
        break;
      default:
        break;
    }

    return result;
  }, [filters, sortBy]);

  const totalPages = Math.ceil(filteredCars.length / ITEMS_PER_PAGE);
  const paginatedCars = filteredCars.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleApply = () => {
    setPage(1);
    setSidebarOpen(false);
  };

  const handleClear = () => {
    setFilters({
      search: '',
      makes: [],
      yearFrom: '',
      yearTo: '',
      priceMin: '',
      priceMax: '',
      bodyTypes: [],
      transmission: 'All',
      fuelTypes: [],
      sourceFilter: 'All',
    });
    setPage(1);
  };

  return (
    <div className="stock-page">
      <PageTitle
        title="Stock List"
        breadcrumbs={[{ label: 'Stock List' }]}
      />

      <div className="stock-page__layout wrap section">
        <FilterSidebar
          filters={filters}
          setFilters={setFilters}
          onApply={handleApply}
          onClear={handleClear}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="stock-page__results">
          <div className="stock-page__toolbar">
            <div className="stock-page__toolbar-left">
              <button
                className="stock-page__filter-toggle"
                onClick={() => setSidebarOpen(true)}
              >
                <SlidersHorizontal size={16} />
                Filters
              </button>
              <span className="stock-page__count">
                Showing {paginatedCars.length} of {filteredCars.length} vehicles
              </span>
            </div>
            <div className="stock-page__toolbar-right">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="stock-page__sort"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="year-new">Year: Newest</option>
                <option value="mileage-low">Mileage: Lowest</option>
              </select>
              <div className="stock-page__view-toggle">
                <button
                  className={`stock-page__view-btn${viewMode === 'grid' ? ' stock-page__view-btn--active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  className={`stock-page__view-btn${viewMode === 'list' ? ' stock-page__view-btn--active' : ''}`}
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className={`stock-page__grid stock-page__grid--${viewMode}`}>
            {paginatedCars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>

          {paginatedCars.length === 0 && (
            <div className="stock-page__empty">
              <p>No vehicles match your current filters.</p>
              <button className="btn btn--outline" onClick={handleClear}>Clear Filters</button>
            </div>
          )}

          {totalPages > 1 && (
            <div className="stock-page__pagination">
              <button
                className="stock-page__page-btn"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={`stock-page__page-btn${p === page ? ' stock-page__page-btn--active' : ''}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
              <button
                className="stock-page__page-btn"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      <CTABanner />
    </div>
  );
}
