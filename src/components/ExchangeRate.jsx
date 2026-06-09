import { useCallback, useEffect, useState } from 'react';
import { TrendingUp, RefreshCw } from 'lucide-react';
import { getExchangeRate } from '../api/site';
import './ExchangeRate.css';

export default function ExchangeRate({ variant = 'compact' }) {
  const [rate, setRate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchRate = useCallback(async (signal) => {
    try {
      setLoading(true);
      setError(false);
      const data = await getExchangeRate({ signal });
      if (data && Number.isFinite(data.rate)) {
        setRate(data);
      } else {
        setError(true);
      }
    } catch (e) {
      if (e && e.name === 'AbortError') return;
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchRate(controller.signal);
    const interval = setInterval(() => fetchRate(controller.signal), 30 * 60 * 1000);
    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [fetchRate]);

  if (loading && !rate) {
    return (
      <div className={`exchange-rate exchange-rate--${variant}`}>
        <span className="exchange-rate__loading">Loading rate...</span>
      </div>
    );
  }

  if (error && !rate) {
    return (
      <div className={`exchange-rate exchange-rate--${variant}`}>
        <span className="exchange-rate__error">Rate unavailable</span>
      </div>
    );
  }

  if (!rate) return null;

  const jpyFormatted = Number(rate.rate).toFixed(2);

  if (variant === 'compact') {
    return (
      <div className="exchange-rate exchange-rate--compact">
        <TrendingUp size={13} className="exchange-rate__icon" />
        <span className="exchange-rate__value">$1 = {jpyFormatted}</span>
      </div>
    );
  }

  return (
    <div className="exchange-rate exchange-rate--full">
      <div className="exchange-rate__header">
        <div className="exchange-rate__header-left">
          <TrendingUp size={16} />
          <h4 className="exchange-rate__title">Exchange Rate</h4>
        </div>
        <button className="exchange-rate__refresh" onClick={() => fetchRate()} aria-label="Refresh rate">
          <RefreshCw size={14} />
        </button>
      </div>
      <div className="exchange-rate__rates">
        <div className="exchange-rate__rate-row">
          <span className="exchange-rate__rate-value">$1 = {jpyFormatted}</span>
        </div>
      </div>
      <div className="exchange-rate__footer">
        <span className="exchange-rate__source">via MUFG Bank{rate.stale ? ' (cached)' : ''}</span>
      </div>
    </div>
  );
}
