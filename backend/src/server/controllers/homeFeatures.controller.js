import { prisma } from '../config/db.js';
import { logger } from '../utils/logger.js';

const DEFAULT_SECTION_TITLE = 'اكتشف قوة ميزاتنا';
const DEFAULT_SECTION_SUBTITLE =
  'لوريم إيبسوم دولور سيت أميت، كونسيكتتور أديبيسسينغ إليت. آينان أوت فولتبات نيسي.';

const DEFAULT_ITEMS = [
  {
    layout: 'compact',
    title: 'تحليل صحيح',
    description:
      'لوريم إيبسوم دولور سيت أميت كونسيكتتور أديبيسسينغ إليت. آينان أوت فولتبات نيسي. نولا فيفيرا أوديو نيك ريسوس فيهيكولا لوكتوس.',
    imageUrl: '',
    sortOrder: 0,
  },
  {
    layout: 'compact',
    title: 'التقارير والتحليلات',
    description:
      'لوريم إيبسوم دولور سيت أميت كونسيكتتور أديبيسسينغ إليت. آينان أوت فولتبات نيسي. نولا فيفيرا أوديو نيك ريسوس فيهيكولا لوكتوس.',
    imageUrl: '',
    sortOrder: 1,
  },
  {
    layout: 'wide',
    title: 'استمتع بنقل مجاني إلى أي وجهة في جميع أنحاء العالم',
    description:
      'لوريم إيبسوم دولور سيت أميت كونسيكتتور أديبيسسينغ إليت. آينان أوت فولتبات نيسي. نولا فيفيرا أوديو نيك ريسوس فيهيكولا لوكتوس.',
    imageUrl: '',
    sortOrder: 2,
  },
];

function parseItems(json) {
  if (!json || typeof json !== 'string') return [...DEFAULT_ITEMS];
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed) || parsed.length === 0) return [...DEFAULT_ITEMS];
    return parsed
      .map((row, i) => ({
        layout: row.layout === 'wide' ? 'wide' : 'compact',
        title: typeof row.title === 'string' ? row.title : '',
        description: typeof row.description === 'string' ? row.description : '',
        imageUrl: typeof row.imageUrl === 'string' ? row.imageUrl : '',
        sortOrder: Number.isFinite(row.sortOrder) ? row.sortOrder : i,
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder);
  } catch {
    return [...DEFAULT_ITEMS];
  }
}

function normalizeIncomingItems(items) {
  if (!Array.isArray(items)) return [...DEFAULT_ITEMS];
  return items.map((row, i) => ({
    layout: row.layout === 'wide' ? 'wide' : 'compact',
    title: row.title != null ? String(row.title) : '',
    description: row.description != null ? String(row.description) : '',
    imageUrl: row.imageUrl != null ? String(row.imageUrl) : '',
    sortOrder: Number.isFinite(Number(row.sortOrder)) ? Number(row.sortOrder) : i,
  }));
}

export async function getHomeFeatures(req, res) {
  try {
    const row = await prisma.homeFeatures.findFirst({ orderBy: { id: 'desc' } });
    if (!row) {
      return res.json({
        sectionTitle: DEFAULT_SECTION_TITLE,
        sectionSubtitle: DEFAULT_SECTION_SUBTITLE,
        items: DEFAULT_ITEMS,
      });
    }
    const items = parseItems(row.itemsJson);
    res.json({
      id: row.id,
      sectionTitle: row.sectionTitle,
      sectionSubtitle: row.sectionSubtitle,
      items,
    });
  } catch (err) {
    logger.error('getHomeFeatures error', { message: err.message });
    res.status(500).json({ message: 'Failed to fetch home features' });
  }
}

export async function updateHomeFeatures(req, res) {
  try {
    const { sectionTitle, sectionSubtitle, items } = req.body;
    let normalizedItems = normalizeIncomingItems(items);
    if (!normalizedItems.length) normalizedItems = [...DEFAULT_ITEMS];
    const itemsJson = JSON.stringify(normalizedItems);

    const existing = await prisma.homeFeatures.findFirst();
    if (existing) {
      const updated = await prisma.homeFeatures.update({
        where: { id: existing.id },
        data: {
          sectionTitle: sectionTitle ?? existing.sectionTitle,
          sectionSubtitle: sectionSubtitle ?? existing.sectionSubtitle,
          itemsJson,
        },
      });
      return res.json({
        message: 'Updated',
        data: {
          id: updated.id,
          sectionTitle: updated.sectionTitle,
          sectionSubtitle: updated.sectionSubtitle,
          items: parseItems(updated.itemsJson),
        },
      });
    }
    const created = await prisma.homeFeatures.create({
      data: {
        sectionTitle: sectionTitle || DEFAULT_SECTION_TITLE,
        sectionSubtitle:
          sectionSubtitle !== undefined && sectionSubtitle !== null
            ? String(sectionSubtitle)
            : DEFAULT_SECTION_SUBTITLE,
        itemsJson,
      },
    });
    res.json({
      message: 'Created',
      data: {
        id: created.id,
        sectionTitle: created.sectionTitle,
        sectionSubtitle: created.sectionSubtitle,
        items: parseItems(created.itemsJson),
      },
    });
  } catch (err) {
    logger.error('updateHomeFeatures error', { message: err.message });
    res.status(500).json({ message: 'Failed to update home features' });
  }
}
