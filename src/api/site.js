import { apiGet, apiBaseUrl } from './client';

export async function getSettings(options) {
  const payload = await apiGet('/settings', undefined, options);
  return payload?.data || {};
}

export async function getPage(slug, options) {
  const payload = await apiGet(`/page/${encodeURIComponent(slug)}`, undefined, options);
  return payload?.data || null;
}

export async function getMakes(options) {
  const payload = await apiGet('/makes', undefined, options);
  return payload?.data || [];
}

export async function getBodyTypes(options) {
  const payload = await apiGet('/body-types', undefined, options);
  return payload?.data || [];
}

export async function getHeroSlides(options) {
  const payload = await apiGet('/hero-slides', undefined, options);
  return payload?.data || [];
}

export async function getPartners(options) {
  const payload = await apiGet('/partners', undefined, options);
  return payload?.data || [];
}

export async function getProcessSteps(options) {
  const payload = await apiGet('/process-steps', undefined, options);
  return payload?.data || [];
}

export async function getServices(options) {
  const payload = await apiGet('/services', undefined, options);
  return payload?.data || [];
}

export async function getExchangeRate(options) {
  const payload = await apiGet('/exchange-rate', undefined, options);
  const d = payload?.data || {};
  return {
    from: d.from || 'USD',
    to: d.to || 'JPY',
    rate: typeof d.rate === 'number' ? d.rate : Number(d.rate),
    fetchedAt: d.fetched_at,
    stale: !!d.stale,
  };
}

export async function getYouTubeFeed(options) {
  const payload = await apiGet('/youtube-feed', undefined, options);
  return {
    videos: payload?.data || [],
    stale: !!payload?.meta?.stale,
  };
}

export function getShippingPdfUrl() {
  return `${apiBaseUrl()}/shipping-pdf`;
}

export async function getShippingSchedule(options) {
  const payload = await apiGet('/shipping-schedule', undefined, options);
  return {
    regions: payload?.data || [],
    stale: !!payload?.meta?.stale,
    fetchedAt: payload?.meta?.fetched_at || null,
  };
}
