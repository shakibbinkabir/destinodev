import { apiGet } from './client';

function mapDelivered(row) {
  if (!row) return row;
  return {
    id: row.id,
    make: row.make,
    model: row.model,
    year: row.year,
    customerName: row.customer_name,
    destination: row.destination_country,
    destinationCity: row.destination_city,
    deliveryDate: row.delivery_date,
    testimonial: row.testimonial_text,
    image: row.image,
  };
}

export async function listDeliveredCars(filters = {}, options) {
  const params = {};
  if (filters.country) params.country = filters.country;
  if (filters.year) params.year = filters.year;
  if (filters.page) params.page = filters.page;
  if (filters.per_page) params.per_page = filters.per_page;

  const payload = await apiGet('/delivered-cars', params, options);
  return {
    data: (payload?.data || []).map(mapDelivered),
    meta: payload?.meta || {},
    facets: payload?.meta?.facets || { countries: [], years: [] },
  };
}
