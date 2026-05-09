import { apiPost } from './client';

/**
 * Submits a customer review per PRD §8.5. Returns {id} on success;
 * the testimonial is stored with status='pending' and only appears
 * publicly after admin approval.
 */
export async function submitReview(payload, options) {
  const body = {
    name: payload.name,
    country: payload.country || null,
    vehicle: payload.vehicle || null,
    rating: Number(payload.rating) || 5,
    text: payload.review || payload.text || '',
  };
  if (payload.email) body.email = payload.email;

  const res = await apiPost('/reviews', body, options);
  return res?.data || null;
}
