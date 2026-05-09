import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Generic data-loading hook.
 *
 * - `fetcher(signal)` — async function that takes an AbortSignal and returns data.
 * - `deps` — array of dependencies; the effect re-runs when any change.
 * - Returns `{ data, loading, error, refetch }`. AbortError is swallowed
 *   (it just means the component unmounted or deps changed mid-fetch).
 */
export function useApi(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const [tick, setTick] = useState(0);
  const refetch = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    setLoading(true);
    setError(null);

    Promise.resolve()
      .then(() => fetcherRef.current(controller.signal))
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err && err.name === 'AbortError') return;
        setError(err);
        setLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  return { data, loading, error, refetch };
}
