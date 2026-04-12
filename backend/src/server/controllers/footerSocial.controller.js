import { prisma } from '../config/db.js';
import { logger } from '../utils/logger.js';

const URL_KEYS = ['twitter', 'instagram', 'youtube', 'facebook', 'linkedin', 'tiktok'];

function getModel() {
  const m = prisma?.footerSocial;
  return m && typeof m.findFirst === 'function' ? m : null;
}

function normalizeUrl(v) {
  if (v == null) return null;
  const s = String(v).trim();
  if (!s) return null;
  if (!/^https?:\/\//i.test(s)) return null;
  return s.slice(0, 2000);
}

function rowToPayload(row) {
  if (!row) {
    return {
      twitter: null,
      instagram: null,
      youtube: null,
      facebook: null,
      linkedin: null,
      tiktok: null,
    };
  }
  return {
    twitter: row.twitter ?? null,
    instagram: row.instagram ?? null,
    youtube: row.youtube ?? null,
    facebook: row.facebook ?? null,
    linkedin: row.linkedin ?? null,
    tiktok: row.tiktok ?? null,
  };
}

export async function getFooterSocial(req, res) {
  const Model = getModel();
  if (!Model) {
    return res.json(rowToPayload(null));
  }
  try {
    const row = await Model.findFirst({ orderBy: { id: 'desc' } });
    res.set('Cache-Control', 'public, max-age=60');
    res.json(rowToPayload(row));
  } catch (err) {
    logger.error('getFooterSocial error', { message: err.message, code: err?.code });
    if (err?.code === 'P2021' || /FooterSocial|footer_social/i.test(String(err.message))) {
      return res.json(rowToPayload(null));
    }
    res.status(500).json({ message: 'Failed to fetch footer social links' });
  }
}

export async function updateFooterSocial(req, res) {
  const Model = getModel();
  if (!Model) {
    return res.status(503).json({
      message: 'قاعدة البيانات غير جاهزة. نفّذ: npx prisma db push && npx prisma generate',
    });
  }
  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const patch = {};
    for (const key of URL_KEYS) {
      if (body[key] !== undefined) {
        patch[key] = normalizeUrl(body[key]);
      }
    }

    const existing = await Model.findFirst();
    if (existing) {
      if (Object.keys(patch).length === 0) {
        return res.json({ message: 'OK', data: rowToPayload(existing) });
      }
      const updated = await Model.update({
        where: { id: existing.id },
        data: patch,
      });
      return res.json({ message: 'Updated', data: rowToPayload(updated) });
    }

    const createData = {};
    for (const k of URL_KEYS) {
      createData[k] = body[k] !== undefined ? normalizeUrl(body[k]) : null;
    }
    const created = await Model.create({ data: createData });
    res.json({ message: 'Created', data: rowToPayload(created) });
  } catch (err) {
    logger.error('updateFooterSocial error', { message: err.message });
    res.status(500).json({ message: 'Failed to update footer social links' });
  }
}
