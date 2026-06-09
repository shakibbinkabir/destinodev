import { useEffect, useState } from 'react';
import { getExchangeRate } from '../api/site';

/**
 * Module-level cache for the USD→JPY rate, mirroring useSettings: many price
 * components (every CarCard, the single-car page, the stock filter) need the
 * rate at once, so we dedupe to a single in-flight request and reuse the value
 * for the session. The header's ExchangeRate component owns the live ticker;
 * here we just need the number for converting prices.
 */
let cached = null;
let inflight = null;
const subscribers = new Set();

function notifyAll() {
  for (const fn of subscribers) fn(cached);
}

function ensureLoaded() {
  if (cached) return Promise.resolve(cached);
  if (inflight) return inflight;
  inflight = getExchangeRate()
    .then((data) => {
      cached = data && Number.isFinite(data.rate) ? data : null;
      inflight = null;
      notifyAll();
      return cached;
    })
    .catch((err) => {
      inflight = null;
      throw err;
    });
  return inflight;
}

export function useExchangeRate() {
  const [data, setData] = useState(cached);
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    let cancelled = false;
    const onUpdate = (val) => {
      if (!cancelled) setData(val);
    };
    subscribers.add(onUpdate);

    if (cached) {
      setLoading(false);
    } else {
      ensureLoaded().finally(() => {
        if (!cancelled) setLoading(false);
      });
    }

    return () => {
      cancelled = true;
      subscribers.delete(onUpdate);
    };
  }, []);

  return {
    rate: data && Number.isFinite(data.rate) ? data.rate : null,
    stale: !!(data && data.stale),
    loading,
  };
}
