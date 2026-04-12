/**
 * Parse Location.addresses from DB (JSON string, sometimes double-encoded).
 * Normalize keys so frontend always gets { city, fullAddress, ... }.
 */
export function parseLocationAddressesJson(raw) {
  if (raw == null || raw === '') return [];
  if (Array.isArray(raw)) return normalizeRows(raw);
  if (typeof raw !== 'object') {
    if (typeof raw !== 'string') return [];
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return [];
    }
    if (typeof parsed === 'string') {
      try {
        parsed = JSON.parse(parsed);
      } catch {
        return [];
      }
    }
    if (!Array.isArray(parsed)) return [];
    return normalizeRows(parsed);
  }
  return [];
}

function normalizeRows(rows) {
  return rows
    .map((row) => {
      if (!row || typeof row !== 'object') return null;
      const city = String(row.city ?? row.name ?? row.title ?? '').trim();
      const fullAddress = String(
        row.fullAddress ??
          row.full_address ??
          row.address ??
          row.line1 ??
          row.description ??
          '',
      ).trim();
      if (!city && !fullAddress) return null;
      const out = {
        city,
        fullAddress,
      };
      const me = row.mapEmbedUrl ?? row.map_embed_url;
      if (typeof me === 'string' && me.trim()) out.mapEmbedUrl = me.trim();
      if (typeof row.lat === 'number' && Number.isFinite(row.lat)) out.lat = row.lat;
      if (typeof row.lng === 'number' && Number.isFinite(row.lng)) out.lng = row.lng;
      return out;
    })
    .filter(Boolean);
}
