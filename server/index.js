import express from 'express';
import cors from 'cors';
import { getCachedRate, setCachedRate, getLastCachedRate } from './db.js';

const app = express();
const PORT = 3001;

const API_KEY = 'a463b11d7d1925a3425402ca';
const API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

async function fetchFreshRate() {
  console.log('[ExchangeRate] Fetching fresh rate from API...');
  const res = await fetch(API_URL);

  if (!res.ok) {
    throw new Error(`API responded with status ${res.status}`);
  }

  const data = await res.json();

  if (data.result !== 'success') {
    throw new Error(`API error: ${data['error-type'] || 'unknown'}`);
  }

  const jpyRate = data.conversion_rates.JPY;
  const usdPerJpy = 1 / jpyRate;

  const rateData = {
    baseCode: 'USD',
    jpyRate,
    usdPerJpy,
    lastUpdated: data.time_last_update_utc || new Date().toISOString(),
  };

  setCachedRate(rateData);
  console.log(`[ExchangeRate] Cached: 1 USD = ${jpyRate} JPY`);

  return {
    ...rateData,
    fetchedAt: Date.now(),
    cached: false,
    cacheAgeMinutes: 0,
  };
}

app.get('/api/exchange-rate', async (req, res) => {
  try {
    const cached = getCachedRate();

    if (cached) {
      console.log(`[ExchangeRate] Serving cached rate (${cached.cacheAgeMinutes} min old)`);
      return res.json({
        success: true,
        data: cached,
      });
    }

    const fresh = await fetchFreshRate();
    return res.json({
      success: true,
      data: fresh,
    });
  } catch (err) {
    console.error('[ExchangeRate] Error:', err.message);

    const stale = getLastCachedRate();
    if (stale) {
      return res.json({
        success: true,
        data: {
          baseCode: stale.base_code,
          jpyRate: stale.jpy_rate,
          usdPerJpy: stale.usd_per_jpy,
          lastUpdated: stale.last_updated,
          fetchedAt: stale.fetched_at,
          cached: true,
          stale: true,
          cacheAgeMinutes: Math.round((Date.now() - stale.fetched_at) / 60000),
        },
        warning: 'Using stale cached data. API fetch failed.',
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to fetch exchange rate and no cached data available.',
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`[Destino API] Server running on http://localhost:${PORT}`);
  console.log(`[Destino API] Exchange rate endpoint: http://localhost:${PORT}/api/exchange-rate`);

  fetchFreshRate().catch((err) => {
    console.warn('[ExchangeRate] Initial fetch failed:', err.message);
  });
});
