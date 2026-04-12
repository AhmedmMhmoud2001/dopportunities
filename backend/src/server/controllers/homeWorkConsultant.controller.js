import { prisma } from '../config/db.js';
import { logger } from '../utils/logger.js';

const DEFAULT_WORK_TITLE = '# طريقة عملنا';
const DEFAULT_WORK_SUBTITLE =
  'لوريم ايبسوم دولار سيت أميت سيت كويرات كونسيفيكات كويرات. لابوري دونك، ني';
const DEFAULT_STEP =
  'لوريم ايبسوم دولار سيت أميت يوت إنكيديديونت أد إكزيرسيتيشن ك';
const DEFAULT_CONSULTANT_ROLE = 'CEO';
const DEFAULT_CONSULTANT_HEADING = '# المستشار أنور علي';
const DEFAULT_CONSULTANT_BIO =
  'متخصص في تأسيس الشركات وقد أسست أكثر من 400+ شركة في عمان والسعودية وبرأس مال أجنبي 100% خلال مدة إنجاز تتراوح بين 30 إلى 60 يوم عمل ولدي من الخبرة ما يؤهلني لتجاوز أي عقبات في مرحلة تأسيس الشركة وأحمل عنك هم ذلك وأسلمك لك أوراق شركتك جاهزة دون عناء مع فريق عملي المتناهي وفروعي في السعودية وسلطنة عمان.';

function defaultPayload() {
  return {
    workTitle: DEFAULT_WORK_TITLE,
    workSubtitle: DEFAULT_WORK_SUBTITLE,
    step1Text: DEFAULT_STEP,
    step2Text: DEFAULT_STEP,
    step3Text: DEFAULT_STEP,
    consultantRole: DEFAULT_CONSULTANT_ROLE,
    consultantHeading: DEFAULT_CONSULTANT_HEADING,
    consultantBio: DEFAULT_CONSULTANT_BIO,
    consultantImageUrl: null,
  };
}

function getModel() {
  const m = prisma?.homeWorkConsultant;
  return m && typeof m.findFirst === 'function' ? m : null;
}

export async function getHomeWorkConsultant(req, res) {
  const Model = getModel();
  if (!Model) {
    logger.error('Prisma client missing HomeWorkConsultant — run: npx prisma generate');
    return res.json(defaultPayload());
  }
  try {
    const row = await Model.findFirst({ orderBy: { id: 'desc' } });
    if (!row) return res.json(defaultPayload());
    res.json({
      id: row.id,
      workTitle: row.workTitle,
      workSubtitle: row.workSubtitle,
      step1Text: row.step1Text,
      step2Text: row.step2Text,
      step3Text: row.step3Text,
      consultantRole: row.consultantRole,
      consultantHeading: row.consultantHeading,
      consultantBio: row.consultantBio,
      consultantImageUrl: row.consultantImageUrl ?? null,
    });
  } catch (err) {
    logger.error('getHomeWorkConsultant error', { message: err.message, code: err?.code });
    if (
      err?.code === 'P2021' ||
      /HomeWorkConsultant|home_work_consultant/i.test(String(err.message)) ||
      /reading 'findFirst'/.test(String(err.message))
    ) {
      return res.json(defaultPayload());
    }
    res.status(500).json({ message: 'Failed to fetch home work consultant' });
  }
}

export async function updateHomeWorkConsultant(req, res) {
  const Model = getModel();
  if (!Model) {
    logger.error('Prisma client missing HomeWorkConsultant — run: npx prisma generate');
    return res.status(503).json({
      message:
        'عميل Prisma قديم. أوقف السيرفر، من مجلد backend: npx prisma generate ثم أعد التشغيل.',
    });
  }
  try {
    const b = req.body || {};
    const workTitle = b.workTitle !== undefined ? String(b.workTitle) : DEFAULT_WORK_TITLE;
    const workSubtitle = b.workSubtitle !== undefined ? String(b.workSubtitle) : DEFAULT_WORK_SUBTITLE;
    const step1Text = b.step1Text !== undefined ? String(b.step1Text) : DEFAULT_STEP;
    const step2Text = b.step2Text !== undefined ? String(b.step2Text) : DEFAULT_STEP;
    const step3Text = b.step3Text !== undefined ? String(b.step3Text) : DEFAULT_STEP;
    const consultantRole =
      b.consultantRole !== undefined ? String(b.consultantRole) : DEFAULT_CONSULTANT_ROLE;
    const consultantHeading =
      b.consultantHeading !== undefined ? String(b.consultantHeading) : DEFAULT_CONSULTANT_HEADING;
    const consultantBio =
      b.consultantBio !== undefined ? String(b.consultantBio) : DEFAULT_CONSULTANT_BIO;
    const consultantImageUrl =
      b.consultantImageUrl !== undefined && b.consultantImageUrl !== null && b.consultantImageUrl !== ''
        ? String(b.consultantImageUrl)
        : null;

    const existing = await Model.findFirst();
    let row;
    if (existing) {
      row = await Model.update({
        where: { id: existing.id },
        data: {
          workTitle,
          workSubtitle,
          step1Text,
          step2Text,
          step3Text,
          consultantRole,
          consultantHeading,
          consultantBio,
          consultantImageUrl,
        },
      });
    } else {
      row = await Model.create({
        data: {
          workTitle,
          workSubtitle,
          step1Text,
          step2Text,
          step3Text,
          consultantRole,
          consultantHeading,
          consultantBio,
          consultantImageUrl,
        },
      });
    }
    res.json({
      message: 'Updated',
      data: {
        id: row.id,
        workTitle: row.workTitle,
        workSubtitle: row.workSubtitle,
        step1Text: row.step1Text,
        step2Text: row.step2Text,
        step3Text: row.step3Text,
        consultantRole: row.consultantRole,
        consultantHeading: row.consultantHeading,
        consultantBio: row.consultantBio,
        consultantImageUrl: row.consultantImageUrl,
      },
    });
  } catch (err) {
    logger.error('updateHomeWorkConsultant error', { message: err.message, code: err?.code });
    if (
      err?.code === 'P2021' ||
      /HomeWorkConsultant|home_work_consultant/i.test(String(err.message)) ||
      /reading 'findFirst'/.test(String(err.message))
    ) {
      return res.status(503).json({
        message:
          'جدول غير جاهز. أوقف السيرفر، ثم: npx prisma db push && npx prisma generate',
      });
    }
    res.status(500).json({ message: 'Failed to update home work consultant' });
  }
}
