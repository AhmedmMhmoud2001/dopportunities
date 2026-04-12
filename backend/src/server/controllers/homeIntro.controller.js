import { prisma } from '../config/db.js';
import { logger } from '../utils/logger.js';

const DEFAULT_STATS = [
  { value: '2K', label: 'عميل', sortOrder: 0 },
  { value: '+300', label: 'شركة ناجحة', sortOrder: 1 },
  { value: '10+', label: 'خبرة', sortOrder: 2 },
];

const DEFAULT_HEADING = '# كيف تعمل خدماتنا ؟';
const DEFAULT_BODY =
  'لوريم ايبسوم دولار سيت أميت يوت دونك، ميو كويس لامبور إي نوسترو كويس كويرات. كونسيكوات. يوت أليكوي دونك، يوت كونسيكوات. إنيم ديتيكتورمي ديواس إيليت، ماجنا إي ديتيكتورمي كونسيكتيتور كويس ديواس إنكيديديونت نيسيوت أولامكو نوسترو إنيم لابوري نويس إيليت، أليكوي.';

function parseStats(json) {
  if (!json || typeof json !== 'string') return [...DEFAULT_STATS];
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed) || parsed.length === 0) return [...DEFAULT_STATS];
    return parsed
      .map((row, i) => ({
        value: typeof row.value === 'string' ? row.value : String(row.value ?? ''),
        label: typeof row.label === 'string' ? row.label : '',
        sortOrder: Number.isFinite(row.sortOrder) ? row.sortOrder : i,
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder);
  } catch {
    return [...DEFAULT_STATS];
  }
}

function normalizeStats(items) {
  if (!Array.isArray(items)) return [...DEFAULT_STATS];
  const out = items.map((row, i) => ({
    value: row.value != null ? String(row.value) : '',
    label: row.label != null ? String(row.label) : '',
    sortOrder: Number.isFinite(Number(row.sortOrder)) ? Number(row.sortOrder) : i,
  }));
  return out.length ? out : [...DEFAULT_STATS];
}

function defaultHomeIntroPayload() {
  return {
    stats: DEFAULT_STATS,
    howHeading: DEFAULT_HEADING,
    howBody: DEFAULT_BODY,
    howVideoUrl: null,
    howPosterUrl: null,
  };
}

/** Prisma client must be regenerated after adding HomeIntro to schema (`npx prisma generate`). */
function getHomeIntroModel() {
  const m = prisma?.homeIntro;
  return m && typeof m.findFirst === 'function' ? m : null;
}

export async function getHomeIntro(req, res) {
  const HomeIntro = getHomeIntroModel();
  if (!HomeIntro) {
    logger.error('Prisma client missing HomeIntro — stop the API, then run: npx prisma generate');
    return res.json(defaultHomeIntroPayload());
  }
  try {
    const row = await HomeIntro.findFirst({ orderBy: { id: 'desc' } });
    if (!row) {
      return res.json(defaultHomeIntroPayload());
    }
    res.json({
      id: row.id,
      stats: parseStats(row.statsJson),
      howHeading: row.howHeading,
      howBody: row.howBody,
      howVideoUrl: row.howVideoUrl ?? null,
      howPosterUrl: row.howPosterUrl ?? null,
    });
  } catch (err) {
    logger.error('getHomeIntro error', { message: err.message, code: err?.code });
    // P2021 = table missing; findFirst TypeError = client not regenerated after schema change
    if (
      err?.code === 'P2021' ||
      /HomeIntro|home_intro/i.test(String(err.message)) ||
      /reading 'findFirst'/.test(String(err.message))
    ) {
      return res.json(defaultHomeIntroPayload());
    }
    res.status(500).json({ message: 'Failed to fetch home intro' });
  }
}

export async function updateHomeIntro(req, res) {
  const HomeIntro = getHomeIntroModel();
  if (!HomeIntro) {
    logger.error('Prisma client missing HomeIntro — stop the API, then run: npx prisma generate');
    return res.status(503).json({
      message:
        'عميل Prisma قديم أو غير مُحدَّث. أوقف السيرفر (nodemon)، من مجلد backend نفّذ: npx prisma generate ثم شغّل السيرفر من جديد. على Windows قد يظهر EPERM إذا كان السيرفر ما زال يعمل.',
    });
  }
  try {
    const { stats, howHeading, howBody, howVideoUrl, howPosterUrl } = req.body;
    let normalizedStats = normalizeStats(stats);
    if (!normalizedStats.length) normalizedStats = [...DEFAULT_STATS];
    const statsJson = JSON.stringify(normalizedStats);

    const existing = await HomeIntro.findFirst();
    if (existing) {
      const updated = await HomeIntro.update({
        where: { id: existing.id },
        data: {
          statsJson,
          howHeading: howHeading !== undefined ? howHeading : existing.howHeading,
          howBody: howBody !== undefined ? howBody : existing.howBody,
          howVideoUrl: howVideoUrl !== undefined ? howVideoUrl : existing.howVideoUrl,
          howPosterUrl: howPosterUrl !== undefined ? howPosterUrl : existing.howPosterUrl,
        },
      });
      return res.json({
        message: 'Updated',
        data: {
          id: updated.id,
          stats: parseStats(updated.statsJson),
          howHeading: updated.howHeading,
          howBody: updated.howBody,
          howVideoUrl: updated.howVideoUrl,
          howPosterUrl: updated.howPosterUrl,
        },
      });
    }
    const created = await HomeIntro.create({
      data: {
        statsJson,
        howHeading: howHeading || DEFAULT_HEADING,
        howBody: howBody || DEFAULT_BODY,
        howVideoUrl: howVideoUrl ?? null,
        howPosterUrl: howPosterUrl ?? null,
      },
    });
    res.json({
      message: 'Created',
      data: {
        id: created.id,
        stats: parseStats(created.statsJson),
        howHeading: created.howHeading,
        howBody: created.howBody,
        howVideoUrl: created.howVideoUrl,
        howPosterUrl: created.howPosterUrl,
      },
    });
  } catch (err) {
    logger.error('updateHomeIntro error', { message: err.message, code: err?.code });
    if (
      err?.code === 'P2021' ||
      /HomeIntro|home_intro/i.test(String(err.message)) ||
      /reading 'findFirst'/.test(String(err.message))
    ) {
      return res.status(503).json({
        message:
          'جدول HomeIntro أو عميل Prisma غير جاهز. أوقف السيرفر، ثم من مجلد backend: npx prisma db push && npx prisma generate ثم أعد التشغيل.',
      });
    }
    res.status(500).json({ message: 'Failed to update home intro' });
  }
}
