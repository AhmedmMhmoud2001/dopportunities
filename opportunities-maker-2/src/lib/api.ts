export const DEFAULT_API_BASE_URL = 'http://localhost:5000/api';

/**
 * Dev (Vite): default `/api` + proxy → same origin as :5174, no CORS.
 * Set VITE_API_BASE_URL to override (e.g. direct http://localhost:5000/api).
 */
export function getApiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (fromEnv?.trim()) return fromEnv.trim();
  if (import.meta.env.DEV) return '/api';
  return DEFAULT_API_BASE_URL;
}

function extractLatLngFromGoogleMapsUrl(u: string): { lat: number; lng: number; zoom: number } | null {
  const at = u.match(/@(-?\d+\.?\d*),\s*(-?\d+\.?\d*)(?:,\s*(\d+(?:\.\d+)?)\s*z)?/i);
  if (at) {
    const lat = parseFloat(at[1]);
    const lng = parseFloat(at[2]);
    let zoom = 16;
    if (at[3] != null) {
      const z = parseFloat(at[3]);
      if (Number.isFinite(z)) zoom = Math.min(21, Math.max(1, Math.round(z)));
    }
    if (Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
      return { lat, lng, zoom };
    }
  }
  const qPair = u.match(/[?&#]q=(-?\d+\.?\d*),\s*(-?\d+\.?\d*)(?:&|#|$)/i);
  if (qPair) {
    const lat = parseFloat(qPair[1]);
    const lng = parseFloat(qPair[2]);
    if (Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
      return { lat, lng, zoom: 16 };
    }
  }
  const ll = u.match(/[?&]ll=(-?\d+\.?\d*),\s*(-?\d+\.?\d*)(?:&|#|$)/i);
  if (ll) {
    const lat = parseFloat(ll[1]);
    const lng = parseFloat(ll[2]);
    if (Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
      return { lat, lng, zoom: 16 };
    }
  }
  return null;
}

function isGoogleMapsMapsPath(pathname: string): boolean {
  return pathname.includes('/maps');
}

/**
 * Google Maps iframe src must be a full https URL on google.com.
 * - Relative `embed?pb=...` loads from your site → 400.
 * - Broken or partial `pb=` → "Invalid pb parameter"; we convert place/search URLs with @lat,lng to `q=…&output=embed`.
 */
export function normalizeGoogleMapsEmbedUrl(raw: string): string {
  let u = raw.trim().replace(/[\r\n\t]+/g, '');
  const iframeMatch = u.match(/src\s*=\s*["']([^"']+)["']/i);
  if (iframeMatch) u = iframeMatch[1].trim();
  u = u.replace(/&amp;/g, '&').replace(/&#038;/g, '&');
  if (!u) return u;
  if (u.startsWith('//')) u = `https:${u}`;
  if (/^embed\?/i.test(u)) return `https://www.google.com/maps/${u}`;
  if (/^\/maps\/embed/i.test(u)) return `https://www.google.com${u}`;
  if (/^maps\/embed/i.test(u)) return `https://www.google.com/${u}`;
  if (/^www\.google\.com\/maps\/embed/i.test(u)) return `https://${u}`;

  let absolute = u;
  if (!/^https?:\/\//i.test(absolute)) {
    if (/^www\./i.test(absolute)) absolute = `https://${absolute}`;
    else return u;
  }
  if (absolute.startsWith('http://')) absolute = `https${absolute.slice(4)}`;

  try {
    const parsed = new URL(absolute);
    const path = parsed.pathname || '';

    if (/\/maps\/embed\b/i.test(path)) {
      return absolute;
    }

    const host = parsed.hostname.toLowerCase();
    const hostOk =
      host === 'maps.google.com' ||
      host === 'www.google.com' ||
      host === 'google.com' ||
      host.endsWith('.google.com');

    if (hostOk && isGoogleMapsMapsPath(path)) {
      const coords = extractLatLngFromGoogleMapsUrl(absolute);
      if (coords) {
        const q = `${coords.lat},${coords.lng}`;
        return `https://www.google.com/maps?q=${encodeURIComponent(q)}&z=${coords.zoom}&output=embed&hl=ar`;
      }
    }
  } catch {
    /* keep absolute */
  }

  return absolute;
}

/** Turn `/uploads/...` or relative paths into a URL the browser can load. */
export function resolvePublicAssetUrl(url: string): string {
  const u = url.trim();
  if (!u) return u;

  // Stored URLs like http://localhost:5173/uploads/... (wrong origin) → use /uploads/... so Vite proxy hits the API
  try {
    const parsed = new URL(u);
    const local =
      parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
    if (local && parsed.pathname.startsWith('/uploads/')) {
      return resolvePublicAssetUrl(parsed.pathname + parsed.search);
    }
  } catch {
    /* not absolute */
  }

  if (u.startsWith('http://') || u.startsWith('https://')) return u;
  const apiBase = getApiBaseUrl();
  const origin = apiBase.replace(/\/api\/?$/i, '');
  const path = u.startsWith('/') ? u : `/${u}`;
  if (!origin) return path;
  return `${origin}${path}`;
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export async function apiRequest<T>(
  path: string,
  opts?: {
    method?: string;
    token?: string | null;
    body?: unknown;
    /** Avoid stale 304 / disk cache for CMS payloads */
    cache?: RequestCache;
  },
): Promise<T> {
  const url = `${getApiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;
  const method = opts?.method ?? 'GET';
  const token = opts?.token ?? null;

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (opts?.body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers,
    body: opts?.body !== undefined ? JSON.stringify(opts.body) : undefined,
    cache: opts?.cache ?? 'default',
  });

  if (res.status === 204) return null as T;

  const data = await safeJson(res);
  if (!res.ok) {
    const message =
      (data && (data.message || data.error)) || `Request failed (${res.status})`;
    throw new ApiError(message, res.status, data);
  }
  return data as T;
}

