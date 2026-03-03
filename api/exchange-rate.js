const API_KEY = 'a463b11d7d1925a3425402ca';
const API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const apiRes = await fetch(API_URL);

    if (!apiRes.ok) {
      throw new Error(`API responded with status ${apiRes.status}`);
    }

    const data = await apiRes.json();

    if (data.result !== 'success') {
      throw new Error(`API error: ${data['error-type'] || 'unknown'}`);
    }

    const jpyRate = data.conversion_rates.JPY;
    const usdPerJpy = 1 / jpyRate;

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200');

    return res.json({
      success: true,
      data: {
        baseCode: 'USD',
        jpyRate,
        usdPerJpy,
        lastUpdated: data.time_last_update_utc || new Date().toISOString(),
        fetchedAt: Date.now(),
        cached: false,
        cacheAgeMinutes: 0,
      },
    });
  } catch (err) {
    console.error('[ExchangeRate] Error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch exchange rate.',
    });
  }
}
