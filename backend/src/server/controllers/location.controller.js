import { prisma } from '../config/db.js';
import { logger } from '../utils/logger.js';
import { normalizeAddressesMapEmbedsAsync } from '../utils/mapsEmbed.js';
import { parseLocationAddressesJson } from '../utils/parseLocationAddresses.js';

const DEFAULT_ADDRESSES = [
  {
    city: 'الرياض',
    fullAddress:
      'شارع زيد بن ثابت, حي الملز, بناء رقم 56, الدور الاول, مكتب رقم 8, الرياض, المملكة العربية السعودية.',
  },
  {
    city: 'جدة',
    fullAddress:
      'عمارة لا إله إلا الله, المدخل الشرقي, الدور التاسع, مكتب رقم 82, شارع فلسطين, حي الشرفية, جدة, المملكة العربية السعودية.',
  },
];

export async function getLocations(req, res) {
  try {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    const location = await prisma.location.findFirst({ orderBy: { id: 'desc' } });
    if (!location) {
      return res.json({
        sectionTitle: 'فروعنا',
        sectionDesc: 'ابدأ رحلتك مع صناع الفرص...اعرف اقرب فرع إليك الآن',
        callTitle: 'اتصل بنا',
        callDesc: 'لا تتردد في التواصل',
        phone: '920032165',
        workingHours: 'الأحد - الخميس: 10ص - 5م\nالجمعة - السبت: مغلق',
        addresses: DEFAULT_ADDRESSES,
        heroTagline: null,
        logoUrl: null,
        mapImageUrl: null,
        companySubtitle: null,
      });
    }
    let addresses = parseLocationAddressesJson(location.addresses);
    addresses = await normalizeAddressesMapEmbedsAsync(addresses);
    res.json({
      id: location.id,
      sectionTitle: location.sectionTitle,
      sectionDesc: location.sectionDesc,
      callTitle: location.callTitle,
      callDesc: location.callDesc,
      phone: location.phone,
      workingHours: location.workingHours,
      addresses,
      heroTagline: location.heroTagline ?? null,
      logoUrl: location.logoUrl ?? null,
      mapImageUrl: location.mapImageUrl ?? null,
      companySubtitle: location.companySubtitle ?? null,
    });
  } catch (err) {
    logger.error('getLocations error', { message: err.message });
    res.status(500).json({ message: 'Failed to fetch locations' });
  }
}

export async function updateLocations(req, res) {
  try {
    const {
      sectionTitle,
      sectionDesc,
      callTitle,
      callDesc,
      phone,
      workingHours,
      addresses,
      heroTagline,
      logoUrl,
      mapImageUrl,
      companySubtitle,
    } = req.body;
    const addressesToStore =
      addresses != null
        ? await normalizeAddressesMapEmbedsAsync(parseLocationAddressesJson(addresses))
        : null;
    const existing = await prisma.location.findFirst();
    if (existing) {
      const updated = await prisma.location.update({
        where: { id: existing.id },
        data: {
          sectionTitle: sectionTitle ?? existing.sectionTitle,
          sectionDesc: sectionDesc ?? existing.sectionDesc,
          callTitle: callTitle ?? existing.callTitle,
          callDesc: callDesc ?? existing.callDesc,
          phone: phone ?? existing.phone,
          workingHours: workingHours ?? existing.workingHours,
          addresses: addressesToStore ? JSON.stringify(addressesToStore) : existing.addresses,
          heroTagline: heroTagline !== undefined ? heroTagline : existing.heroTagline,
          logoUrl: logoUrl !== undefined ? logoUrl : existing.logoUrl,
          mapImageUrl: mapImageUrl !== undefined ? mapImageUrl : existing.mapImageUrl,
          companySubtitle: companySubtitle !== undefined ? companySubtitle : existing.companySubtitle,
        },
      });
      return res.json({ message: 'Updated', data: updated });
    }
    const created = await prisma.location.create({
      data: {
        sectionTitle: sectionTitle || 'فروعنا',
        sectionDesc: sectionDesc || 'ابدأ رحلتك مع صناع الفرص...اعرف اقرب فرع إليك الآن',
        callTitle: callTitle || 'اتصل بنا',
        callDesc: callDesc || 'لا تتردد في التواصل',
        phone: phone || '920032165',
        workingHours: workingHours || 'الأحد - الخميس: 10ص - 5م\nالجمعة - السبت: مغلق',
        addresses: addressesToStore ? JSON.stringify(addressesToStore) : '[]',
        heroTagline: heroTagline ?? null,
        logoUrl: logoUrl ?? null,
        mapImageUrl: mapImageUrl ?? null,
        companySubtitle: companySubtitle ?? null,
      },
    });
    res.json({ message: 'Created', data: created });
  } catch (err) {
    logger.error('updateLocations error', { message: err.message });
    res.status(500).json({ message: 'Failed to update locations' });
  }
}