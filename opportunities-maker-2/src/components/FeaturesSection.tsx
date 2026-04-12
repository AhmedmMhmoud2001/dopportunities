import './FeaturesSection.css';
import rightDesign from '../assets/images/many_pages.png';
import statistics from '../assets/images/feature_section_1.png';
import transportation from '../assets/images/feature_section_2.png';
import AnimatedSection from './AnimatedSection';
import { useEffect, useState } from 'react';
import { apiRequest, resolvePublicAssetUrl } from '../lib/api';

type FeatureLayout = 'compact' | 'wide';

interface HomeFeatureItem {
  layout: FeatureLayout;
  title: string;
  description: string;
  imageUrl?: string;
  sortOrder: number;
}

interface HomeFeaturesResponse {
  sectionTitle?: string;
  sectionSubtitle?: string;
  items?: HomeFeatureItem[];
}

const STATIC_TITLE = 'اكتشف قوة ميزاتنا';
const STATIC_SUBTITLE =
  'لوريم إيبسوم دولور سيت أميت، كونسيكتتور أديبيسسينغ إليت. آينان أوت فولتبات نيسي.';

const STATIC_ITEMS: HomeFeatureItem[] = [
  {
    layout: 'compact',
    title: 'تحليل صحيح',
    description:
      'لوريم إيبسوم دولور سيت أميت كونسيكتتور أديبيسسينغ إليت. آينان أوت فولتبات نيسي. نولا فيفيرا أوديو نيك ريسوس فيهيكولا لوكتوس.',
    sortOrder: 0,
  },
  {
    layout: 'compact',
    title: 'التقارير والتحليلات',
    description:
      'لوريم إيبسوم دولور سيت أميت كونسيكتتور أديبيسسينغ إليت. آينان أوت فولتبات نيسي. نولا فيفيرا أوديو نيك ريسوس فيهيكولا لوكتوس.',
    sortOrder: 1,
  },
  {
    layout: 'wide',
    title: 'استمتع بنقل مجاني إلى أي وجهة في جميع أنحاء العالم',
    description:
      'لوريم إيبسوم دولور سيت أميت كونسيكتتور أديبيسسينغ إليت. آينان أوت فولتبات نيسي. نولا فيفيرا أوديو نيك ريسوس فيهيكولا لوكتوس.',
    sortOrder: 2,
  },
];

function resolveItemImage(item: HomeFeatureItem, compactIndex: number): string {
  const raw = item.imageUrl?.trim();
  if (raw) return resolvePublicAssetUrl(raw);
  if (item.layout === 'wide') return transportation;
  return compactIndex === 0 ? rightDesign : statistics;
}

function FeaturesSection() {
  const [sectionTitle, setSectionTitle] = useState(STATIC_TITLE);
  const [sectionSubtitle, setSectionSubtitle] = useState(STATIC_SUBTITLE);
  const [items, setItems] = useState<HomeFeatureItem[]>(STATIC_ITEMS);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiRequest<HomeFeaturesResponse>('/v1/home-features');
        if (cancelled) return;
        if (res?.sectionTitle) setSectionTitle(res.sectionTitle);
        if (res?.sectionSubtitle != null) setSectionSubtitle(res.sectionSubtitle);
        if (Array.isArray(res?.items) && res.items.length > 0) {
          const normalized: HomeFeatureItem[] = res.items
            .map((row, i) => ({
              layout: (row.layout === 'wide' ? 'wide' : 'compact') as FeatureLayout,
              title: row.title ?? '',
              description: row.description ?? '',
              imageUrl: row.imageUrl,
              sortOrder: Number.isFinite(row.sortOrder) ? row.sortOrder! : i,
            }))
            .sort((a, b) => a.sortOrder - b.sortOrder);
          setItems(normalized);
        }
      } catch {
        /* keep static defaults */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const compactItems = items.filter((i) => i.layout === 'compact').sort((a, b) => a.sortOrder - b.sortOrder);
  const wideItems = items.filter((i) => i.layout === 'wide').sort((a, b) => a.sortOrder - b.sortOrder);

  let compactIdx = 0;

  return (
    <section className="features-section">
      <div className="container">
        <AnimatedSection animationType="fade-in-down" delay={0}>
          <div className="features-header">
            <h2 className="features-title">{sectionTitle}</h2>
            <p className="features-subtitle">{sectionSubtitle}</p>
          </div>
        </AnimatedSection>

        {compactItems.length > 0 ? (
          <div className="features-grid">
            {compactItems.map((item, gridIndex) => {
              const cIdx = compactIdx;
              compactIdx += 1;
              const src = resolveItemImage(item, cIdx);
              const delay = 100 + gridIndex * 100;
              const anim = gridIndex % 2 === 0 ? 'fade-in-right' : 'fade-in-left';
              return (
                <AnimatedSection key={`c-${item.sortOrder}-${gridIndex}`} animationType={anim} delay={delay}>
                  <div className="feature-card hover-lift">
                    <div className="feature-content">
                      <div className="feature-header-item">
                        <div className="feature-dot"></div>
                        <h3 className="feature-title">{item.title}</h3>
                      </div>
                      <p className="feature-description">{item.description}</p>
                    </div>
                    <div className="feature-image">
                      <img src={src} alt="" className="feature-img" />
                    </div>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        ) : null}

        {wideItems.map((item, wIndex) => {
          const src = resolveItemImage(item, 0);
          return (
            <AnimatedSection key={`w-${item.sortOrder}-${wIndex}`} animationType="fade-in-up" delay={300 + wIndex * 80}>
              <div className="feature-card feature-card-wide hover-lift">
                <div className="feature-content">
                  <div className="feature-header-item">
                    <div className="feature-dot"></div>
                    <h3 className="feature-title">{item.title}</h3>
                  </div>
                  <p className="feature-description">{item.description}</p>
                </div>
                <div className="feature-image">
                  <img src={src} alt="" className="feature-img" />
                </div>
              </div>
            </AnimatedSection>
          );
        })}
      </div>
    </section>
  );
}

export default FeaturesSection;
