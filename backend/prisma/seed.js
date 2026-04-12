/**
 * Prisma seed — محتوى واقعي لموقع «صناع الفرص» (تأسيس شركات، استشارات، السعودية وعُمان).
 * التشغيل: npx prisma db seed   أو   npm run seed
 * إعادة ضبط كاملة للقاعدة: npx prisma migrate reset
 */
import 'dotenv/config';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function env(name, fallback) {
  const v = process.env[name];
  return v === undefined || v === null || v === '' ? fallback : v;
}

const UNSPLASH = (id, w = 800) => `https://images.unsplash.com/${id}?w=${w}&h=450&fit=crop&q=80`;

async function wipe() {
  await prisma.$transaction([
    prisma.contactRequest.deleteMany(),
    prisma.user.deleteMany(),
    prisma.page.deleteMany(),
    prisma.blog.deleteMany(),
    prisma.faq.deleteMany(),
    prisma.service.deleteMany(),
    prisma.testimonial.deleteMany(),
    prisma.testimonialsSection.deleteMany(),
    prisma.location.deleteMany(),
    prisma.homeFeatures.deleteMany(),
    prisma.homeIntro.deleteMany(),
    prisma.homeWorkConsultant.deleteMany(),
    prisma.footerSocial.deleteMany(),
  ]);
}

async function main() {
  const wipeFirst = env('SEED_WIPE', 'true') === 'true';
  if (wipeFirst) {
    console.log('🧹 مسح البيانات الحالية قبل الإدخال...');
    await wipe();
  }

  const adminEmail = env('SEED_ADMIN_EMAIL', 'admin@dopportunities.local');
  const adminPassword = env('SEED_ADMIN_PASSWORD', 'Admin@12345');
  const adminName = env('SEED_ADMIN_NAME', 'مدير النظام');
  const userEmail = env('SEED_USER_EMAIL', 'user@dopportunities.local');
  const userPassword = env('SEED_USER_PASSWORD', 'User@12345');
  const userName = env('SEED_USER_NAME', 'مستخدم تجريبي');

  const adminHash = await bcrypt.hash(adminPassword, 10);
  const userHash = await bcrypt.hash(userPassword, 10);

  await prisma.user.createMany({
    data: [
      { email: adminEmail, name: adminName, role: 'admin', passwordHash: adminHash },
      { email: userEmail, name: userName, role: 'user', passwordHash: userHash },
    ],
  });
  console.log(`✅ مستخدمون: admin=${adminEmail} / user=${userEmail}`);

  const pages = [
    {
      slug: 'services',
      title: 'الخدمات',
      content:
        'نحن في «صناع الفرص» نركز على مسارين رئيسيين لخدمة رواد الأعمال والمستثمرين:\n\n' +
        '1) تأسيس شركة بملكية أجنبية كاملة في المملكة العربية السعودية عبر هيكل استثماري واضح يشمل الاستحواذ على كيان أجنبي مؤهل وربطه بالكيان السعودي بما يتوافق مع متطلبات الاستثمار الأجنبي.\n\n' +
        '2) تأسيس الشركات في سلطنة عُمان مع إعداد ملف الترخيص، اختيار النموذج القانوني المناسب، ومتابعة الإجراءات لدى الجهات المختصة.\n\n' +
        'نقدّم جداول زمنية شفافة، وثائق مرتبة، ومتابعة مع فريق عمل يجمع بين الخبرة المحلية والالتزام بأعلى معايير الجودة. للاستفسار أو طلب عرض: تواصل معنا عبر صفحة «تواصل معنا» أو اتصل على الرقم الموحد الظاهر في صفحة الفروع.',
    },
    {
      slug: 'faq',
      title: 'الأسئلة الشائعة',
      content:
        'هنا تجد إجابات عن أشهر الاستفسارات حول التأسيس، المدة، الوثائق، والاستثمار الأجنبي. يمكنك أيضاً تصفح قائمة الأسئلة التفصيلية في صفحة الأسئلة الشائعة.',
    },
    {
      slug: 'about',
      title: 'من نحن',
      content:
        '«صناع الفرص» منصة استشارية متخصصة في تسهيل تأسيس الشركات ودخول الأسواق في السعودية وعُمان. نعمل مع المستثمرين الأفراد والشركات لتقليل التعقيد الإداري وتوضيح الخطوات القانونية والمالية.',
    },
    {
      slug: 'contact',
      title: 'تواصل معنا',
      content:
        'يسعدنا استقبال طلبك عبر النموذج الإلكتروني. اذكر نوع النشاط المطلوب (تأسيس في السعودية، تأسيس في عُمان، استشارة استثمارية) وسيتواصل معك الفريق خلال أوقات العمل الرسمية.',
    },
    {
      slug: 'about_company',
      title: 'شركة صناع الفرص',
      content:
        'نؤمن بأن نجاح المستثمر يبدأ من قرار قانوني سليم وخطة تأسيس واقعية. منذ سنوات نرافق عملاءنا من الفكرة حتى إصدار السجل التجاري والتراخيص، مع التركيز على الشفافية والالتزام بالمواعيد المتفق عليها.',
    },
    {
      slug: 'about_mission',
      title: 'مهمتنا',
      content:
        'تبسيط رحلة التأسيس والامتثال للجهات التنظيمية، وتقديم استشارات عملية تساعد عملاءنا على اتخاذ قرارات واضحة بثقة.',
    },
    {
      slug: 'about_vision',
      title: 'رؤيتنا',
      content:
        'أن نكون الشريك الأول لرواد الأعمال الراغبين في التوسع في السعودية وعُمان، مع سمعة مبنية على الخبرة والمصداقية.',
    },
    {
      slug: 'about_consultant',
      title: 'المستشار أنور علي',
      content:
        'خبير في تأسيس الشركات وملفات الاستثمار الأجنبي، عمل مع مئات المشاريع في السعودية وسلطنة عُمان. يهتم بربط الرؤية الاستثمارية بالإجراءات العملية وإدارة التوقعات الزمنية بصراحة مع العميل.',
    },
  ];

  await prisma.page.createMany({ data: pages });
  console.log(`✅ صفحات: ${pages.length}`);

  const blogs = [
    {
      slug: 'vision-2030-and-foreign-investment',
      title: 'رؤية 2030 وفرص الاستثمار الأجنبي في السعودية',
      author: 'فريق صناع الفرص',
      publishedAt: new Date('2025-11-02'),
      imageUrl: UNSPLASH('photo-1486406146926-c627a92ad1ab'),
      content:
        'تستمر المملكة في تبسيط بيئة الأعمال وفتح قطاعات جديدة أمام الاستثمار الأجنبي. في هذا المقال نلخص أهم الاتجاهات التي تهم المستثمر عند التخطيط للتأسيس أو التوسع.\n\n' +
        '• وضوح الإطار التنظيمي لعدة قطاعات.\n' +
        '• أهمية اختيار الشكل القانوني المناسب مبكراً.\n' +
        '• دور الاستشارة المبكرة في تقليل التأخير والتكلفة.\n\n' +
        'للمزيد من التفاصيل حسب نشاطك، راسلنا عبر نموذج التواصل.',
    },
    {
      slug: 'oman-business-setup-guide',
      title: 'دليل مختصر: تأسيس شركة في سلطنة عُمان',
      author: 'فريق صناع الفرص',
      publishedAt: new Date('2025-09-18'),
      imageUrl: UNSPLASH('photo-1512453979798-5ea266f8880c'),
      content:
        'سلطنة عُمان توفر خيارات متعددة للمستثمرين حسب حجم النشاط والقطاع. الخطوات النموذجية تشمل: تحديد النشاط، حجز الاسم التجاري، إعداد عقد التأسيس، والحصول على التراخيص اللازمة.\n\n' +
        'ننصح بمراجعة متطلبات كل وزارة أو جهة تنظيمية مرتبطة بنشاطك قبل تثبيت الهيكل النهائي للشركة.',
    },
    {
      slug: 'licensing-timeline-realistic-expectations',
      title: 'كم تستغرق إجراءات الترخيص؟ توقعات واقعية',
      author: 'فريق صناع الفرص',
      publishedAt: new Date('2025-07-05'),
      imageUrl: UNSPLASH('photo-1454165804606-c3d57bc86b40'),
      content:
        'تختلف المدة حسب نوع الترخيص، اكتمال المستندات، والجهة المختصة. في كثير من الحالات، التأخير ينتج عن نقص في الوثائق أو تغيير في نطاق النشاط.\n\n' +
        'مع خطة واضحة ومتابعة منتظمة، يمكن تقليل المفاجآت والحفاظ على جدول زمني معقول.',
    },
    {
      slug: 'investment-consulting-when-you-need-it',
      title: 'متى تحتاج استشارة استثمارية قبل التأسيس؟',
      author: 'فريق صناع الفرص',
      publishedAt: new Date('2026-01-14'),
      imageUrl: UNSPLASH('photo-1460925895917-afdab827c52f'),
      content:
        'إذا كنت تدخل سوقاً جديداً، أو تتعامل مع شركاء متعددين، أو تحتاج هيكلاً يجمع بين كيانات في أكثر من دولة، فالاستشارة المبكرة غالباً توفر الوقت والمال.\n\n' +
        'نحدد معك نقاط القرار الحرجة: الشكل القانوني، التمويل، والالتزامات التنظيمية الأساسية.',
    },
  ];

  await prisma.blog.createMany({ data: blogs });
  console.log(`✅ مقالات: ${blogs.length}`);

  const services = [
    {
      slug: 'saudi-foreign-ownership-setup',
      title: 'تأسيس شركة بملكية أجنبية في السعودية',
      description:
        'متابعة كاملة لمسار التأسيس والترخيص بما يتوافق مع متطلبات الاستثمار الأجنبي، بما في ذلك التنسيق حول الهيكل المناسب والوثائق المطلوبة.',
      imageUrl: UNSPLASH('photo-1581094794329-c8112a89af12', 900),
      sortOrder: 1,
      isActive: true,
    },
    {
      slug: 'oman-company-formation',
      title: 'تأسيس الشركات في سلطنة عُمان',
      description:
        'دعم في اختيار النموذج القانوني، إعداد الملفات، ومتابعة الإجراءات لدى الجهات المختصة حتى إصدار السجل والتراخيص.',
      imageUrl: UNSPLASH('photo-1500382017468-9049fed747ef', 900),
      sortOrder: 2,
      isActive: true,
    },
    {
      slug: 'investment-advisory',
      title: 'استشارات استثمارية ودخول السوق',
      description:
        'تحليل أولي للفرص والمخاطر، وتوصيات عملية قبل اتخاذ قرار التوسع أو الشراكة في السوق السعودي أو العُماني.',
      imageUrl: UNSPLASH('photo-1556761175-5973dc0f32e7', 900),
      sortOrder: 3,
      isActive: true,
    },
    {
      slug: 'license-compliance-support',
      title: 'دعم التراخيص والامتثال',
      description:
        'مساعدة في تحديث التراخيص، تعديل الأنشطة، والتنسيق مع الجهات عند الحاجة بعد التأسيس.',
      imageUrl: UNSPLASH('photo-1450101499163-c8848c66ca85', 900),
      sortOrder: 4,
      isActive: true,
    },
  ];

  await prisma.service.createMany({ data: services });
  console.log(`✅ خدمات: ${services.length}`);

  const faqs = [
    {
      question: 'كم تستغرق عملية تأسيس شركة في السعودية أو عُمان؟',
      answer:
        'المدة تعتمد على نوع الترخيص واكتمال المستندات. غالباً تتراوح بين بضعة أسابيع إلى عدة أشهر. نقدّم جدولاً زمنياً مبدئياً بعد مراجعة نشاطك.',
      sortOrder: 1,
      isActive: true,
    },
    {
      question: 'هل يمكن ملكية أجنبية كاملة في السعودية؟',
      answer:
        'في العديد من القطاعات أصبحت الخيارات أوضح للمستثمر الأجنبي، لكن يبقى القرار مرتبطاً بنوع النشاط والترخيص. نراجع معك الملاءمة قبل البدء.',
      sortOrder: 2,
      isActive: true,
    },
    {
      question: 'ما الوثائق الشائعة المطلوبة للبدء؟',
      answer:
        'عادةً: هويات الشركاء، مخطط مبدئي للنشاط، وفي بعض الحالات مستندات إضافية حسب الجهة التنظيمية. نرسل لك قائمة مخصصة حسب نوع الطلب.',
      sortOrder: 3,
      isActive: true,
    },
    {
      question: 'هل تقدمون خدمات فقط في السعودية وعُمان؟',
      answer:
        'نعم، هذا هو تركيزنا لضمان عمق الخبرة وجودة المتابعة في هذين السوقين.',
      sortOrder: 4,
      isActive: true,
    },
    {
      question: 'كيف أتابع حالة طلبي بعد التسجيل؟',
      answer:
        'ستحصل على رقم تتبع عند إرسال النموذج. يمكنك استخدامه في صفحة تتبع الطلب لمعرفة الحالة المحدثة.',
      sortOrder: 5,
      isActive: true,
    },
    {
      question: 'هل الاستشارة الأولية مدفوعة؟',
      answer:
        'نحدد ذلك حسب نوع الطلب وحجمه. في كثير من الحالات نبدأ بجلسة تعريفية قصيرة لتوضيح الخطوات قبل الالتزام بأي عرض تفصيلي.',
      sortOrder: 6,
      isActive: true,
    },
    {
      question: 'هل تساعدون الشركات القائمة في تعديل الترخيص؟',
      answer:
        'نعم، يمكننا دعم توسعة الأنشطة أو تحديث البيانات وفق المتطلبات الرسمية.',
      sortOrder: 7,
      isActive: true,
    },
    {
      question: 'ما أوقات العمل للتواصل الهاتفي؟',
      answer:
        'الأحد إلى الخميس خلال ساعات العمل الرسمية (تُعرض في صفحة الفروع). ننصح بالمواعيد المسبقة للاستشارات المفصلة.',
      sortOrder: 8,
      isActive: true,
    },
  ];

  await prisma.faq.createMany({ data: faqs });
  console.log(`✅ أسئلة شائعة: ${faqs.length}`);

  const testimonials = [
    {
      name: 'خالد العتيبي',
      quote: 'تجربة منظمة وواضحة',
      text: 'تم إيضاح الخطوات من البداية والتزام الفريق بالمتابعة حتى إصدار السجل. أنصح من يفكر بالتأسيس أن يتواصل معهم مبكراً.',
      imageUrl: UNSPLASH('photo-1507003211169-0a1dd7228f2d', 200),
      sortOrder: 1,
      isActive: true,
    },
    {
      name: 'مريم الحارثي',
      quote: 'وفرتوا علينا وقتاً كبيراً',
      text: 'كنا بحاجة لهيكل يربط بين كيان في الخليج ونشاطنا في السعودية. الفريق تعامل باحتراف مع الملفات والتنسيق.',
      imageUrl: UNSPLASH('photo-1494790108377-be9c29b29330', 200),
      sortOrder: 2,
      isActive: true,
    },
    {
      name: 'سعيد البلوشي',
      quote: 'دعم ممتاز في مسقط',
      text: 'تأسيس الشركة في عُمان تم بسلاسة مع شفافية في التكاليف والمدة. شكراً لفريق صناع الفرص.',
      imageUrl: UNSPLASH('photo-1472099645785-5658abf4ff4e', 200),
      sortOrder: 3,
      isActive: true,
    },
    {
      name: 'نورة القحطاني',
      quote: 'استشارة قبل القرار',
      text: 'الجلسة الاستشارية الأولى ساعدتنا نعيد ترتيب الأولويات ونختار النموذج الأنسب دون تعقيد غير لازم.',
      imageUrl: UNSPLASH('photo-1438761681033-6461ffad8d80', 200),
      sortOrder: 4,
      isActive: true,
    },
    {
      name: 'عمر الزهراني',
      quote: 'متابعة حتى النهاية',
      text: 'لم نكن متخصصين في الإجراءات الحكومية؛ كان وجود جهة تتابع الملف نقطة تحول لنا.',
      imageUrl: UNSPLASH('photo-1500648767791-00dcc994a43e', 200),
      sortOrder: 5,
      isActive: true,
    },
  ];

  await prisma.testimonial.createMany({ data: testimonials });
  console.log(`✅ آراء عملاء: ${testimonials.length}`);

  await prisma.testimonialsSection.create({
    data: {
      sectionTitle: '# آراء عملائنا',
      sectionDescription:
        'نفتخر بثقة المستثمرين ورواد الأعمال الذين اختاروا العمل معنا. فيما يلي بعض التجارب الحقيقية من شركائنا في السعودية وعُمان.',
    },
  });

  const addresses = [
    {
      city: 'الرياض',
      fullAddress:
        'طريق الملك فهد، حي العليا، مجمع أعمال (مثال للعرض)، الطابق 3، مكتب 301، الرياض 12213، المملكة العربية السعودية',
    },
    {
      city: 'جدة',
      fullAddress:
        'شارع الأمير محمد بن عبد العزيز، حي الزهراء، مبنى إداري، الدور الرابع، مكتب 12، جدة 23424، المملكة العربية السعودية',
    },
    {
      city: 'مسقط',
      fullAddress:
        'الرسيل، مجمع تجاري (مثال للعرض)، الطابق الثاني، وحدة 5، مسقط، سلطنة عُمان',
    },
  ];

  await prisma.location.create({
    data: {
      sectionTitle: 'فروعنا',
      sectionDesc: 'ابدأ رحلتك مع صناع الفرص — تواصل مع أقرب فرق لدينا في السعودية أو عُمان',
      callTitle: 'اتصل بنا',
      callDesc: 'فريق خدمة العملاء جاهز للإجابة عن استفساراتك في أوقات العمل',
      phone: '920032165',
      workingHours: 'الأحد – الخميس: 9:00 ص – 6:00 م بتوقيت السعودية\nالجمعة – السبت: مغلق',
      addresses: JSON.stringify(addresses),
      heroTagline: 'نرافقك من الفكرة إلى الترخيص',
      companySubtitle: 'صناع الفرص — تأسيس واستشارات استثمارية',
    },
  });
  console.log('✅ مواقع الفروع');

  const homeFeaturesItems = [
    {
      layout: 'compact',
      title: 'خبرة محلية عميقة',
      description:
        'فريق يعمل يومياً على ملفات التأسيس والترخيص في السعودية وعُمان، مع معرفة محدثة بالإجراءات.',
      imageUrl: '',
      sortOrder: 0,
    },
    {
      layout: 'compact',
      title: 'شفافية في الخطوات',
      description:
        'جداول زمنية واضحة وقائمة وثائق مسبقة تقلل من مفاجآت التأخير أو الطلبات الإضافية غير المتوقعة.',
      imageUrl: '',
      sortOrder: 1,
    },
    {
      layout: 'wide',
      title: 'من الاستشارة الأولى حتى إصدار السجل',
      description:
        'نرافقك في تصميم الهيكل المناسب، تجهيز الملفات، والمتابعة مع الجهات حتى اكتمال الإجراءات بقدر الإمكان من جهتنا.',
      imageUrl: '',
      sortOrder: 2,
    },
  ];

  await prisma.homeFeatures.create({
    data: {
      sectionTitle: 'لماذا صناع الفرص؟',
      sectionSubtitle:
        'نمزج بين الدقة في التفاصيل والسرعة في التنفيذ، لأن وقت المستثمر جزء أساسي من نجاح المشروع.',
      itemsJson: JSON.stringify(homeFeaturesItems),
    },
  });

  const stats = [
    { value: '+500', label: 'عميل وعميلة رافقناهم', sortOrder: 0 },
    { value: '+120', label: 'مشروع تأسيس مكتمل', sortOrder: 1 },
    { value: '10+', label: 'سنوات خبرة تراكمية للفريق', sortOrder: 2 },
  ];

  await prisma.homeIntro.create({
    data: {
      statsJson: JSON.stringify(stats),
      howHeading: '# كيف تعمل خدماتنا؟',
      howBody:
        '1) أرسل طلبك عبر نموذج التواصل مع وصف مختصر للنشاط.\n' +
        '2) يقوم مستشار بمراجعة الحالة والتواصل معك لتحديد المسار والوثائق.\n' +
        '3) نتابع التأسيس والترخيص معك خطوة بخطوة حتى الإنجاز أو التسليم المتفق عليه.\n\n' +
        'يمكنك في أي وقت استخدام رقم التتبع لمعرفة حالة طلبك.',
      howVideoUrl: null,
      howPosterUrl: null,
    },
  });

  await prisma.homeWorkConsultant.create({
    data: {
      workTitle: '# طريقة عملنا',
      workSubtitle: 'ثلاث خطوات عملية نركز فيها على الوضوح والسرعة',
      step1Text: 'تحليل أولي لنشاطك والهيكل الأنسب قانونياً واستثمارياً.',
      step2Text: 'تجهيز ملف الوثائق والتنسيق مع الجهات ذات العلاقة.',
      step3Text: 'متابعة الإصدار والتسليم مع ملخص لما يلي مرحلة التأسيس.',
      consultantRole: 'المستشار المؤسس',
      consultantHeading: '# المستشار أنور علي',
      consultantBio:
        'متخصص في تأسيس الشركات وملفات الاستثمار الأجنبي، عمل مع مئات المشاريع في المملكة العربية السعودية وسلطنة عُمان. يركز على توضيح التوقعات الزمنية والتكلفة مبكراً، وإدارة الملف باحتراف حتى مراحل الإصدار.',
      consultantImageUrl: null,
    },
  });

  await prisma.footerSocial.create({
    data: {
      twitter: 'https://twitter.com',
      instagram: 'https://www.instagram.com',
      youtube: 'https://www.youtube.com',
      facebook: 'https://www.facebook.com',
      linkedin: 'https://www.linkedin.com',
      tiktok: null,
    },
  });
  console.log('✅ الصفحة الرئيسية (ميزات، مقدمة، طريقة العمل) + روابط التواصل');

  if (env('SEED_CONTACTS', 'true') === 'true') {
    const users = await prisma.user.findMany({ where: { email: userEmail }, select: { id: true } });
    const demoUserId = users[0]?.id ?? null;
    const now = new Date();
    const contacts = [
      {
        trackingCode: 'CF-2026-0001',
        userId: demoUserId,
        firstName: 'عبدالله',
        secondName: 'الشهري',
        phoneNumber: '+966501112233',
        activity: 'تأسيس شركة في السعودية — قطاع خدمات',
        status: 'processing',
        notes: 'بانتظار استكمال نسخة من عقد التأسيس.',
        seenByAdminAt: now,
      },
      {
        trackingCode: 'CF-2026-0002',
        userId: null,
        firstName: 'لطيفة',
        secondName: 'الهنائية',
        phoneNumber: '+96899123456',
        activity: 'استشارة استثمارية قبل التوسع في مسقط',
        status: 'pending',
        notes: null,
        seenByAdminAt: null,
      },
      {
        trackingCode: 'CF-2026-0003',
        userId: null,
        firstName: 'فهد',
        secondName: 'الدوسري',
        phoneNumber: '+966507778899',
        activity: 'تعديل نشاط وترخيص قائم',
        status: 'done',
        notes: 'تم إغلاق الملف وتسليم الوثائق للعميل.',
        seenByAdminAt: now,
      },
    ];
    await prisma.contactRequest.createMany({ data: contacts });
    console.log(`✅ طلبات تواصل تجريبية: ${contacts.length}`);
  }

  console.log('\n🎉 اكتمل الـ seed بنجاح.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
