import { prisma } from '../config/db.js';
import { logger } from '../utils/logger.js';

/** يعمل بدون delegate `prisma.siteBranding` (مفيد لو فشل prisma generate بسبب قفل ملفات على Windows). */
function isMissingTableError(err) {
  const msg = String(err?.message || '');
  const code = err?.code;
  const errno = err?.meta?.errno ?? err?.errno ?? err?.cause?.errno;
  return (
    code === 'P2010' ||
    errno === 1146 ||
    /1146|doesn't exist|does not exist|Unknown table|SiteBranding|ER_NO_SUCH_TABLE/i.test(msg)
  );
}

function normalizeAssetUrl(v) {
  if (v == null) return null;
  const s = String(v).trim();
  if (!s) return null;
  if (s.length > 2000) return null;
  if (/^javascript:/i.test(s) || /^data:/i.test(s)) return null;
  if (s.startsWith('/')) return s;
  if (/^https?:\/\//i.test(s)) return s;
  return null;
}

async function loadRowRaw() {
  const rows = await prisma.$queryRaw`SELECT headerLogoUrl, footerLogoUrl FROM SiteBranding WHERE id = 1 LIMIT 1`;
  const r = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
  if (!r) {
    return { headerLogoUrl: null, footerLogoUrl: null };
  }
  const h = r.headerLogoUrl;
  const f = r.footerLogoUrl;
  return {
    headerLogoUrl: h == null ? null : String(h),
    footerLogoUrl: f == null ? null : String(f),
  };
}

export async function getSiteBranding(req, res) {
  try {
    const { headerLogoUrl, footerLogoUrl } = await loadRowRaw();
    res.set('Cache-Control', 'public, max-age=60');
    res.json({ headerLogoUrl, footerLogoUrl });
  } catch (err) {
    logger.error('getSiteBranding error', { message: err.message, code: err?.code });
    if (isMissingTableError(err)) {
      res.set('Cache-Control', 'no-store');
      return res.json({ headerLogoUrl: null, footerLogoUrl: null });
    }
    res.status(500).json({ message: 'Failed to fetch site branding' });
  }
}

export async function updateSiteBranding(req, res) {
  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {};

    const patch = {};
    if (body.headerLogoUrl !== undefined) {
      patch.headerLogoUrl = normalizeAssetUrl(body.headerLogoUrl);
    }
    if (body.footerLogoUrl !== undefined) {
      patch.footerLogoUrl = normalizeAssetUrl(body.footerLogoUrl);
    }

    const curr = await loadRowRaw();
    const nextHeader = patch.headerLogoUrl !== undefined ? patch.headerLogoUrl : curr.headerLogoUrl;
    const nextFooter = patch.footerLogoUrl !== undefined ? patch.footerLogoUrl : curr.footerLogoUrl;

    if (Object.keys(patch).length === 0) {
      return res.json({
        message: 'OK',
        data: {
          headerLogoUrl: curr.headerLogoUrl,
          footerLogoUrl: curr.footerLogoUrl,
        },
      });
    }

    await prisma.$executeRaw`
      INSERT INTO SiteBranding (id, headerLogoUrl, footerLogoUrl, updatedAt)
      VALUES (1, ${nextHeader}, ${nextFooter}, NOW(3))
      ON DUPLICATE KEY UPDATE
        headerLogoUrl = VALUES(headerLogoUrl),
        footerLogoUrl = VALUES(footerLogoUrl),
        updatedAt = NOW(3)
    `;

    res.json({
      message: 'OK',
      data: {
        headerLogoUrl: nextHeader,
        footerLogoUrl: nextFooter,
      },
    });
  } catch (err) {
    logger.error('updateSiteBranding error', { message: err.message, code: err?.code });
    if (isMissingTableError(err)) {
      return res.status(503).json({
        message:
          'جدول SiteBranding غير موجود. من مجلد backend نفّذ: npx prisma migrate deploy أو npx prisma db push ثم أعد المحاولة.',
      });
    }
    res.status(500).json({ message: 'Failed to update site branding' });
  }
}
