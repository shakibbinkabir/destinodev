import { useEffect, useState } from 'react';
import { getSettings } from '../api/site';

/**
 * Module-level cache: settings rarely change at runtime and several
 * unrelated components (Header, Footer, FloatingContact) need them at
 * once. We dedupe to a single in-flight request and reuse the result.
 */
let cachedSettings = null;
let inflight = null;
const subscribers = new Set();

function notifyAll() {
  for (const fn of subscribers) fn(cachedSettings);
}

function ensureLoaded() {
  if (cachedSettings) return Promise.resolve(cachedSettings);
  if (inflight) return inflight;
  inflight = getSettings()
    .then((data) => {
      cachedSettings = data || {};
      inflight = null;
      notifyAll();
      return cachedSettings;
    })
    .catch((err) => {
      inflight = null;
      throw err;
    });
  return inflight;
}

export function useSettings() {
  const [settings, setSettings] = useState(cachedSettings);
  const [loading, setLoading] = useState(!cachedSettings);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const onUpdate = (val) => {
      if (cancelled) return;
      setSettings(val || {});
    };
    subscribers.add(onUpdate);

    if (cachedSettings) {
      setLoading(false);
    } else {
      ensureLoaded()
        .then(() => {
          if (cancelled) return;
          setLoading(false);
        })
        .catch((e) => {
          if (cancelled) return;
          setError(e);
          setLoading(false);
        });
    }

    return () => {
      cancelled = true;
      subscribers.delete(onUpdate);
    };
  }, []);

  return { settings: settings || {}, loading, error };
}

export function get(settings, key, fallback = '') {
  if (!settings) return fallback;
  const v = settings[key];
  return v === undefined || v === null || v === '' ? fallback : v;
}
