import { prisma } from '../config/db.js';
import { logger } from '../utils/logger.js';

function isMissingTableError(err) {
  const msg = String(err?.message || '');
  const code = err?.code;
  const errno = err?.meta?.errno ?? err?.errno ?? err?.cause?.errno;
  return (
    code === 'P2010' ||
    errno === 1146 ||
    /1146|doesn't exist|does not exist|Unknown table|ContactFormSettings|ER_NO_SUCH_TABLE/i.test(msg)
  );
}

const MAX_NOTICE = 10000;

let contactFormSettingsTableEnsured = false;

/** ينشئ الجدول تلقائياً لو الهجرة لم تُطبَّق (يمنع PUT 503 محل التطوير). */
async function ensureContactFormSettingsTable() {
  if (contactFormSettingsTableEnsured) return;
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS ContactFormSettings (
      id INTEGER NOT NULL DEFAULT 1,
      noticeText TEXT NULL,
      updatedAt DATETIME(3) NOT NULL,
      PRIMARY KEY (id)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);
  contactFormSettingsTableEnsured = true;
}

function normalizeNoticeText(v) {
  if (v == null) return null;
  const s = String(v).trim().replace(/\0/g, '');
  if (!s) return null;
  return s.length > MAX_NOTICE ? s.slice(0, MAX_NOTICE) : s;
}

async function loadRowRaw() {
  const rows =
    await prisma.$queryRaw`SELECT noticeText FROM ContactFormSettings WHERE id = 1 LIMIT 1`;
  const r = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
  if (!r || r.noticeText == null) return { noticeText: null };
  return { noticeText: String(r.noticeText) };
}

export async function getContactFormSettings(req, res) {
  try {
    await ensureContactFormSettingsTable();
    const { noticeText } = await loadRowRaw();
    res.set('Cache-Control', 'public, max-age=60');
    res.json({ noticeText });
  } catch (err) {
    logger.error('getContactFormSettings error', { message: err.message, code: err?.code });
    if (isMissingTableError(err)) {
      res.set('Cache-Control', 'no-store');
      return res.json({ noticeText: null });
    }
    res.status(500).json({ message: 'Failed to fetch contact form settings' });
  }
}

export async function updateContactFormSettings(req, res) {
  try {
    await ensureContactFormSettingsTable();

    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const nextText = body.noticeText !== undefined ? normalizeNoticeText(body.noticeText) : undefined;

    if (nextText === undefined) {
      const curr = await loadRowRaw();
      return res.json({ message: 'OK', data: { noticeText: curr.noticeText } });
    }

    await prisma.$executeRaw`
      INSERT INTO ContactFormSettings (id, noticeText, updatedAt)
      VALUES (1, ${nextText}, NOW(3))
      ON DUPLICATE KEY UPDATE
        noticeText = VALUES(noticeText),
        updatedAt = NOW(3)
    `;

    res.json({ message: 'OK', data: { noticeText: nextText } });
  } catch (err) {
    logger.error('updateContactFormSettings error', { message: err.message, code: err?.code });
    if (isMissingTableError(err)) {
      return res.status(503).json({
        message:
          'جدول ContactFormSettings غير موجود. من مجلد backend نفّذ: npx prisma migrate deploy أو npx prisma db push.',
      });
    }
    res.status(500).json({ message: 'Failed to update contact form settings' });
  }
}
