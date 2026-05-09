/**
 * Thin fetch wrapper for the Destino public REST API (PRD §8).
 *
 * - Base URL comes from `VITE_API_BASE_URL`.
 * - JSON only. Always sends `Accept: application/json`.
 * - `credentials: 'omit'` — the public API is unauthenticated and lives
 *   on a different subdomain; we deliberately do not ship cookies.
 * - On non-2xx, throws an `ApiError` carrying status, body, and the parsed
 *   `errors` map (for 422). Callers in pages/components map this to UI state.
 */

const BASE_URL =
  (import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  'http://127.0.0.1:8000/api/v1';

export class ApiError extends Error {
  constructor(message, { status, errors, data } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors || null;
    this.data = data || null;
  }
}

function buildUrl(path, params) {
  const base = BASE_URL.replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  let url = `${base}${cleanPath}`;
  if (params && typeof params === 'object') {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === null || v === '') continue;
      if (Array.isArray(v)) {
        v.forEach((val) => qs.append(k, val));
      } else if (typeof v === 'boolean') {
        qs.set(k, v ? '1' : '0');
      } else {
        qs.set(k, String(v));
      }
    }
    const qsStr = qs.toString();
    if (qsStr) url += `?${qsStr}`;
  }
  return url;
}

async function parseBody(res) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function request(method, path, { params, body, signal } = {}) {
  const url = buildUrl(path, params);
  const init = {
    method,
    headers: {
      Accept: 'application/json',
    },
    credentials: 'omit',
    signal,
  };
  if (body !== undefined) {
    init.headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(url, init);
  } catch (e) {
    if (e && e.name === 'AbortError') throw e;
    throw new ApiError('Network error. Please check your connection.', {
      status: 0,
    });
  }

  const payload = await parseBody(res);

  if (!res.ok) {
    const message =
      (payload && typeof payload === 'object' && payload.message) ||
      `Request failed (${res.status})`;
    const errors =
      payload && typeof payload === 'object' ? payload.errors : null;
    throw new ApiError(message, { status: res.status, errors, data: payload });
  }

  return payload;
}

export function apiGet(path, params, options = {}) {
  return request('GET', path, { params, signal: options.signal });
}

export function apiPost(path, body, options = {}) {
  return request('POST', path, { body, signal: options.signal });
}

export function apiBaseUrl() {
  return BASE_URL.replace(/\/+$/, '');
}
