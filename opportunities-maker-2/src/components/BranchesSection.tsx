import './BranchesSection.css';
import map from '../assets/images/branches_map.png';
import location_1 from '../assets/images/branches_location_1.png';
import location_2 from '../assets/images/branches_location_2.png';
import call from '../assets/images/branches_call.png';
import logo from '../assets/images/branches_logo.png';
import { useEffect, useState } from 'react';
import { apiRequest, resolvePublicAssetUrl } from '../lib/api';

interface BranchAddress {
  city: string;
  fullAddress: string;
  mapEmbedUrl?: string;
  lat?: number;
  lng?: number;
}

interface LocationsApiResponse {
  sectionTitle?: string;
  sectionDesc?: string;
  callTitle?: string;
  callDesc?: string;
  phone?: string;
  workingHours?: string | null;
  addresses?: BranchAddress[];
  heroTagline?: string | null;
  logoUrl?: string | null;
  mapImageUrl?: string | null;
  companySubtitle?: string | null;
}

const DEFAULT_ADDRESSES: BranchAddress[] = [
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

const DEFAULT_HOURS = 'الأحد إلى الخميس: 10:00 ص - 5:00 م\nالجمعة والسبت: مغلق';

function BranchesSection() {
  const [data, setData] = useState<LocationsApiResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const loc = await apiRequest<LocationsApiResponse>('/v1/locations', {
          cache: 'no-store',
        });
        if (!cancelled) setData(loc);
      } catch {
        if (!cancelled) setData(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const title = data?.sectionTitle ?? 'فروعنا';
  const subtitle =
    data?.sectionDesc ??
    'ابدأ رحلتك مع صناع الفرص...اعرف اقرب فرع إليك الآن';
  const contactTitle = data?.callTitle ?? 'اتصل بنا';
  const contactSubtitle = data?.callDesc ?? 'لا تتردد في التواصل';
  const phone = data?.phone ?? '920032165';
  const hoursRaw = data?.workingHours ?? DEFAULT_HOURS;
  const hourLines = String(hoursRaw)
    .split(/\r\n|\n|\\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const rawAddresses = Array.isArray(data?.addresses) ? data.addresses : [];
  const normalized = rawAddresses
    .map((a) => {
      const rec = a as unknown as Record<string, unknown>;
      const city = String(rec?.city ?? rec?.name ?? rec?.title ?? '').trim();
      const fullAddress = String(
        rec?.fullAddress ?? rec?.full_address ?? rec?.address ?? rec?.line1 ?? rec?.description ?? '',
      ).trim();
      return {
        city,
        fullAddress,
        mapEmbedUrl: typeof rec?.mapEmbedUrl === 'string' ? rec.mapEmbedUrl : undefined,
        lat: typeof rec?.lat === 'number' ? rec.lat : undefined,
        lng: typeof rec?.lng === 'number' ? rec.lng : undefined,
      };
    })
    .filter((a) => a.city || a.fullAddress);
  const addresses = normalized.length > 0 ? normalized : DEFAULT_ADDRESSES;

  const heroTagline = data?.heroTagline?.trim() ?? '';
  const logoSrc =
    data?.logoUrl?.trim() != null && data.logoUrl.trim() !== ''
      ? resolvePublicAssetUrl(data.logoUrl.trim())
      : logo;
  const mapSrc =
    data?.mapImageUrl?.trim() != null && data.mapImageUrl.trim() !== ''
      ? resolvePublicAssetUrl(data.mapImageUrl.trim())
      : map;
  const companySubtitle = data?.companySubtitle?.trim() ?? '';

  return (
    <section className="branches-section">
      <div className="container">
        <div className="branches-content">
          <div className="branches-header">
            <div className="branches-header-titles-row">
              <div className="branches-header-top">
                <div className="branches-header-item">
                  <div className="branches-icon-wrapper">
                    <img
                      src={location_1}
                      alt=""
                      className="branches-icon"
                    />
                  </div>
                  <h2 className="branches-title">{title}</h2>
                </div>
                {!heroTagline ? (
                  <p className="branches-subtitle">{subtitle}</p>
                ) : null}
              </div>
              <div className="branches-header-top-2">
                <div className="branches-contact-header">
                  <div className="branches-contact-title-wrapper">
                    <div className="branches-contact-icon">
                      <img
                        src={call}
                        alt=""
                        className="call-icon"
                      />
                    </div>
                    <h3 className="branches-contact-title">{contactTitle}</h3>
                  </div>
                </div>
                {!heroTagline ? (
                  <p className="branches-subtitle">{contactSubtitle}</p>
                ) : null}
              </div>
            </div>
            {heroTagline ? (
              <p className="branches-hero-line">{heroTagline}</p>
            ) : null}
          </div>
          <div className="branches-main">
            <div className="branches-map">
              <div className="map-container">
                <img
                  src={mapSrc}
                  alt=""
                  className="map-img"
                />
                <div className="branches-addresses">
                  {addresses.map((addr, index) => (
                    <div className="address-item" key={`${addr.city}-${index}`}>
                      <div className="address-icon">
                        <img
                          src={location_2}
                          alt=""
                          className="location-icon"
                        />
                      </div>
                      <p className="address-text">
                        {addr.city ? (
                          <>
                            <span className="address-city">{addr.city}</span>
                            {' — '}
                          </>
                        ) : null}
                        {addr.fullAddress}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="branches-info">
              <div className="branches-phone">
                <a href={`tel:${phone.replace(/\s/g, '')}`} className="phone-number">
                  {phone}
                </a>
              </div>
              <div className="branches-logo">
                <img
                  src={logoSrc}
                  alt=""
                  className="logo-img"
                />
                {companySubtitle ? (
                  <p className="branches-company-line">{companySubtitle}</p>
                ) : null}
                <div className="retrieval-time-content">
                  {hourLines.map((line, i) => (
                    <p key={i} className="retrieval-time-text">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default BranchesSection;
