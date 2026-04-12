/**
 * Google Maps iframe src must be a full URL on google.com.
 * Pasting only `embed?pb=...` makes the browser request your own domain → HTTP 400 from Google.
 * Broken `pb=` → "Invalid pb parameter"; URLs with @lat,lng become `q=…&output=embed`.
 */

function extractLatLngFromGoogleMapsUrl(u) {
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

/**
 * Short share links (maps.app.goo.gl, goo.gl) redirect to google.com/maps — they must not be used as iframe src
 * (often blocked or empty inside iframes). We follow redirects on the server and normalize the final URL to embed.
 */
function preprocessMapsInput(raw) {
  if (raw == null || typeof raw !== 'string') return '';
  let u = raw.trim().replace(/[\r\n\t]+/g, '');
  const iframeMatch = u.match(/src\s*=\s*["']([^"']+)["']/i);
  if (iframeMatch) u = iframeMatch[1].trim();
  u = u.replace(/&amp;/g, '&').replace(/&#038;/g, '&');
  return u;
}

function isGoogleMapsShortShareUrl(urlString) {
  try {
    const { hostname } = new URL(urlString);
    const h = hostname.toLowerCase();
    if (h === 'goo.gl' || h === 'maps.app.goo.gl') return true;
    if (h.endsWith('.app.goo.gl')) return true;
    return false;
  } catch {
    return false;
  }
}

export async function expandGoogleMapsShareUrl(raw) {
  const u = preprocessMapsInput(raw);
  if (!u) return u;
  let absolute = u;
  if (u.startsWith('//')) absolute = `https:${u}`;
  if (!/^https?:\/\//i.test(absolute)) return u;
  if (absolute.startsWith('http://')) absolute = `https${absolute.slice(4)}`;
  if (!isGoogleMapsShortShareUrl(absolute)) return u;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(absolute, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });
    const finalUrl = res.url;
    if (finalUrl && finalUrl !== absolute && /google\.com\/maps/i.test(finalUrl)) {
      return finalUrl;
    }
    return u;
  } catch {
    return u;
  } finally {
    clearTimeout(timer);
  }
}

export async function normalizeGoogleMapsEmbedUrlAsync(raw) {
  if (raw == null || typeof raw !== 'string') return raw;
  const expanded = await expandGoogleMapsShareUrl(raw);
  return normalizeGoogleMapsEmbedUrl(expanded);
}

export function normalizeGoogleMapsEmbedUrl(raw) {
  if (raw == null || typeof raw !== 'string') return raw;
  let u = preprocessMapsInput(raw);
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

    if (hostOk && path.includes('/maps')) {
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

export function normalizeAddressesMapEmbeds(addresses) {
  if (!Array.isArray(addresses)) return addresses;
  return addresses.map((row) => {
    if (!row || typeof row !== 'object') return row;
    const url = row.mapEmbedUrl;
    if (typeof url === 'string' && url.trim()) {
      return { ...row, mapEmbedUrl: normalizeGoogleMapsEmbedUrl(url) };
    }
    return row;
  });
}

/** Resolves goo.gl / maps.app.goo.gl then normalizes to an embeddable google.com URL. */
export async function normalizeAddressesMapEmbedsAsync(addresses) {
  if (!Array.isArray(addresses)) return addresses;
  const out = [];
  for (const row of addresses) {
    if (!row || typeof row !== 'object') {
      out.push(row);
      continue;
    }
    const url = row.mapEmbedUrl;
    if (typeof url === 'string' && url.trim()) {
      const mapEmbedUrl = await normalizeGoogleMapsEmbedUrlAsync(url.trim());
      out.push({ ...row, mapEmbedUrl });
    } else {
      out.push(row);
    }
  }
  return out;
}
