// Currency helpers. Car prices are stored/served in USD (the base FOB price the
// One-Price API and operators work in); customers see a Yen price converted from
// the live MUFG rate (USD T.T.B. − ¥4, see backend ExchangeRateService).

const JPY = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'JPY',
  maximumFractionDigits: 0,
});

const USD = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

/** Format a USD amount as Yen using `rate` (JPY per USD). Returns null if either input is invalid. */
export function formatJpy(usd, rate) {
  if (!Number.isFinite(usd) || !Number.isFinite(rate)) return null;
  return JPY.format(Math.round(usd * rate));
}

/** USD fallback for when the exchange rate is unavailable, so a price still renders. */
export function formatUsd(usd) {
  if (!Number.isFinite(usd)) return null;
  return USD.format(usd);
}

/** Format the customer-facing price: Yen when a rate is known, otherwise USD. */
export function formatPrice(usd, rate) {
  return formatJpy(usd, rate) ?? formatUsd(usd) ?? '';
}

/** Convert a Yen amount back to USD (for sending price filters to the USD-based API). */
export function jpyToUsd(yen, rate) {
  if (!Number.isFinite(yen) || !Number.isFinite(rate) || rate <= 0) return null;
  return yen / rate;
}
