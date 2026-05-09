import { apiGet } from './client';

/**
 * The backend serializes cars in snake_case lowercase enums (PRD §8.1).
 * The legacy React components (CarCard, SingleCarPage, FilterSidebar) expect
 * camelCase keys and Title-Case display values for `fuel`, `transmission`,
 * `driveType`. We map at the client edge so JSX stays untouched.
 */

const FUEL_DISPLAY = {
  gasoline: 'Petrol',
  diesel: 'Diesel',
  hybrid: 'Hybrid',
  ev: 'Electric',
};
const FUEL_API = {
  Petrol: 'gasoline',
  Diesel: 'diesel',
  Hybrid: 'hybrid',
  Electric: 'ev',
};

const TRANS_DISPLAY = {
  automatic: 'Automatic',
  manual: 'Manual',
  cvt: 'CVT',
};
const TRANS_API = {
  Automatic: 'automatic',
  Manual: 'manual',
  CVT: 'cvt',
};

function displayDrive(value) {
  if (!value) return value;
  if (value === 'awd') return 'AWD';
  return value.toUpperCase();
}

export function mapCar(c) {
  if (!c) return c;
  return {
    id: c.id,
    make: c.make,
    model: c.model,
    year: c.year,
    price: c.price,
    mileage: c.mileage,
    fuel: FUEL_DISPLAY[c.fuel] || c.fuel,
    transmission: TRANS_DISPLAY[c.transmission] || c.transmission,
    bodyType: c.body_type,
    engineSize: c.engine_size,
    color: c.color,
    driveType: displayDrive(c.drive_type),
    seats: c.seats,
    doors: c.doors,
    condition: c.condition,
    source: c.source,
    featured: c.featured,
    badge: c.badge,
    batteryCapacity: c.battery_capacity,
    motorOutput: c.motor_output,
    description: c.description,
    images: Array.isArray(c.images) ? c.images : [],
  };
}

function mapFilters(filters = {}) {
  const out = {};
  if (filters.q) out.q = filters.q;
  if (filters.make) out.make = filters.make;
  if (filters.body_type) out.body_type = filters.body_type;
  if (filters.bodyType) out.body_type = filters.bodyType;
  if (filters.transmission) {
    out.transmission =
      TRANS_API[filters.transmission] || filters.transmission;
  }
  if (filters.fuel) {
    out.fuel = FUEL_API[filters.fuel] || filters.fuel;
  }
  if (filters.year_from) out.year_from = filters.year_from;
  if (filters.yearFrom) out.year_from = filters.yearFrom;
  if (filters.year_to) out.year_to = filters.year_to;
  if (filters.yearTo) out.year_to = filters.yearTo;
  if (filters.price_min) out.price_min = filters.price_min;
  if (filters.priceMin) out.price_min = filters.priceMin;
  if (filters.price_max) out.price_max = filters.price_max;
  if (filters.priceMax) out.price_max = filters.priceMax;
  if (filters.source) out.source = filters.source;
  if (filters.featured !== undefined && filters.featured !== '')
    out.featured = filters.featured;
  if (filters.sort) out.sort = filters.sort;
  if (filters.page) out.page = filters.page;
  if (filters.per_page) out.per_page = filters.per_page;
  return out;
}

export async function listCars(filters = {}, options) {
  const payload = await apiGet('/cars', mapFilters(filters), options);
  return {
    data: (payload?.data || []).map(mapCar),
    meta: payload?.meta || {},
  };
}

export async function getCar(id, options) {
  const payload = await apiGet(`/cars/${encodeURIComponent(id)}`, undefined, options);
  return mapCar(payload?.data || null);
}

export async function getSimilarCars(id, options) {
  const payload = await apiGet(
    `/cars/${encodeURIComponent(id)}/similar`,
    undefined,
    options,
  );
  return (payload?.data || []).map(mapCar);
}
