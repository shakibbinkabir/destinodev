import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, LayoutGrid, List, ChevronLeft, ChevronRight } from 'lucide-react';
import PageTitle from '../components/PageTitle';
import FilterSidebar from '../components/FilterSidebar';
import CarCard from '../components/CarCard';
import CTABanner from '../components/CTABanner';
import Loading from '../components/Loading';
import ErrorState from '../components/ErrorState';
import { useApi } from '../hooks/useApi';
import { listCars } from '../api/cars';
import './StockListPage.css';

const ITEMS_PER_PAGE = 9;

const SORT_TO_API = {
  newest: 'latest',
  'price-low': 'price_asc',
  'price-high': 'price_desc',
  'year-new': 'year_desc',
  'mileage-low': 'mileage_asc',
};

const SOURCE_TO_API = {
  All: 'all',
  'API Stock': 'api',
  'In-House': 'inhouse',
};

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
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);

  const apiParams = useMemo(() => {
    const out = {
      sort: SORT_TO_API[sortBy] || 'latest',
      per_page: ITEMS_PER_PAGE,
      page,
    };
    if (appliedFilters.search) out.q = appliedFilters.search;
    if (appliedFilters.makes && appliedFilters.makes.length === 1) out.make = appliedFilters.makes[0];
    if (appliedFilters.bodyTypes && appliedFilters.bodyTypes.length === 1) out.bodyType = appliedFilters.bodyTypes[0];
    if (appliedFilters.transmission && appliedFilters.transmission !== 'All') out.transmission = appliedFilters.transmission;
    if (appliedFilters.fuelTypes && appliedFilters.fuelTypes.length === 1) out.fuel = appliedFilters.fuelTypes[0];
    if (appliedFilters.yearFrom) out.year_from = appliedFilters.yearFrom;
    if (appliedFilters.yearTo) out.year_to = appliedFilters.yearTo;
    if (appliedFilters.priceMin) out.price_min = appliedFilters.priceMin;
    if (appliedFilters.priceMax) out.price_max = appliedFilters.priceMax;
    const apiSource = SOURCE_TO_API[appliedFilters.sourceFilter] || 'all';
    if (apiSource !== 'all') out.source = apiSource;
    return out;
  }, [appliedFilters, sortBy, page]);

  const { data, loading, error, refetch } = useApi(
    (signal) => listCars(apiParams, { signal }),
    [JSON.stringify(apiParams)],
  );

  // Multi-select filter dimensions are not natively supported by /api/v1/cars
  // (PRD §8.1 takes a single value per dimension). We post-filter the page
  // client-side when the user picks 2+ makes / body types / fuel types.
  const apiResults = data?.data || [];
  const meta = data?.meta?.pagination || { total: 0, last_page: 1, current_page: page };

  const visibleCars = useMemo(() => {
    let out = [...apiResults];
    if (appliedFilters.makes && appliedFilters.makes.length > 1) {
      out = out.filter((c) => appliedFilters.makes.includes(c.make));
    }
    if (appliedFilters.bodyTypes && appliedFilters.bodyTypes.length > 1) {
      out = out.filter((c) => appliedFilters.bodyTypes.includes(c.bodyType));
    }
    if (appliedFilters.fuelTypes && appliedFilters.fuelTypes.length > 1) {
      out = out.filter((c) => appliedFilters.fuelTypes.includes(c.fuel));
    }
    return out;
  }, [apiResults, appliedFilters]);

  const totalPages = meta.last_page || 1;

  const handleApply = () => {
    setPage(1);
    setAppliedFilters(filters);
    setSidebarOpen(false);
  };

  const handleClear = () => {
    const cleared = {
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
    };
    setFilters(cleared);
    setAppliedFilters(cleared);
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
                Showing {visibleCars.length} of {meta.total} vehicles
              </span>
            </div>
            <div className="stock-page__toolbar-right">
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
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

          {loading ? (
            <Loading label="Loading vehicles…" />
          ) : error ? (
            <ErrorState onRetry={refetch} />
          ) : (
            <>
              <div className={`stock-page__grid stock-page__grid--${viewMode}`}>
                {visibleCars.map((car) => (
                  <CarCard key={car.id} car={car} />
                ))}
              </div>

              {visibleCars.length === 0 && (
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
            </>
          )}
        </div>
      </div>

      <CTABanner />
    </div>
  );
}
