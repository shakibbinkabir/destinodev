import { apiGet } from './client';

function mapTestimonial(t) {
  if (!t) return t;
  return {
    id: t.id,
    name: t.name,
    country: t.country,
    vehicle: t.vehicle,
    stars: t.rating,
    text: t.text,
    image: t.image,
    featured: t.featured,
  };
}

export async function listTestimonials(filters = {}, options) {
  const params = {};
  if (filters.featured) params.featured = true;

  const payload = await apiGet('/testimonials', params, options);
  return (payload?.data || []).map(mapTestimonial);
}
