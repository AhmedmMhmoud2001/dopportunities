import { useEffect, useState } from 'react';
import './LocationsPage.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AnimatedSection from '../components/AnimatedSection';
import { apiRequest, normalizeGoogleMapsEmbedUrl } from '../lib/api';
import { MAIN_NAV_ITEMS } from '../config/mainNav';

interface Address {
  city: string;
  fullAddress: string;
  mapEmbedUrl?: string;
  lat?: number;
  lng?: number;
}

interface LocationData {
  sectionTitle: string;
  sectionDesc: string;
  callTitle: string;
  callDesc: string;
  phone: string;
  workingHours: string;
  addresses: Address[];
  heroTagline?: string | null;
  logoUrl?: string | null;
  mapImageUrl?: string | null;
  companySubtitle?: string | null;
}

/** خط العرض/الطول يعطي تضميناً موثوقاً؛ رابط pb التالف يظهر كـ Invalid pb في Google. */
function branchMapIframeSrc(address: Address): string | null {
  const lat = address.lat != null ? Number(address.lat) : NaN;
  const lng = address.lng != null ? Number(address.lng) : NaN;
  if (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180
  ) {
    return `https://www.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}&z=16&output=embed&hl=ar`;
  }
  const raw = address.mapEmbedUrl?.trim();
  if (!raw) return null;
  return normalizeGoogleMapsEmbedUrl(raw);
}

function LocationsPage() {
  const [data, setData] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLocations() {
      try {
        const result = await apiRequest<LocationData>('/v1/locations');
        setData(result);
      } catch (err) {
        console.error('Failed to load locations:', err);
        setError('فشل تحميل بيانات الفروع');
      } finally {
        setIsLoading(false);
      }
    }
    fetchLocations();
  }, []);

  const handleRegisterClick = () => {
    // معالجة النقر على زر التسجيل
  };

  const formatWorkingHours = (hours: string) => {
    return hours.split('\n').map((line, i) => <p key={i}>{line}</p>);
  };

  return (
    <div className="locations-page">
      <Header 
        navItems={MAIN_NAV_ITEMS}
        registerButtonText="سجل الآن"
        onRegisterClick={handleRegisterClick}
      />
      
      <main className="locations-page-content page-enter">
        <AnimatedSection animationType="fade-in-down" delay={0}>
          <div className="locations-header">
            <h1 className="locations-header-title">
              {data?.sectionTitle || 'فروعنا'}
            </h1>
            <p className="locations-header-subtitle">
              {data?.heroTagline?.trim()
                ? data.heroTagline.trim()
                : data?.sectionDesc || 'ابدأ رحلتك مع صناع الفرص...اعرف اقرب فرع إليك الآن'}
            </p>
          </div>
        </AnimatedSection>

        {isLoading ? (
          <div className="locations-loading">جارٍ التحميل...</div>
        ) : error ? (
          <div className="locations-error">{error}</div>
        ) : (
          <div className="locations-container">
            {/* Contact Section */}
            <AnimatedSection animationType="fade-in-up" delay={100}>
              <div className="locations-contact-section">
                <div className="contact-card">
                  <div className="contact-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                  </div>
                  <div className="contact-info">
                    <h3>{data?.callTitle || 'اتصل بنا'}</h3>
                    <p>{data?.callDesc || 'لا تتردد في التواصل'}</p>
                    <a href={`tel:${data?.phone}`} className="contact-phone">
                      {data?.phone || '920032165'}
                    </a>
                  </div>
                </div>

                <div className="contact-card">
                  <div className="contact-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </div>
                  <div className="contact-info">
                    <h3>أوقات العمل</h3>
                    <div className="working-hours">
                      {formatWorkingHours(data?.workingHours || '')}
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {/* Branches */}
            <div className="locations-branches">
              {data?.addresses?.map((address, index) => {
                const mapSrc = branchMapIframeSrc(address);
                return (
                <AnimatedSection key={index} animationType="fade-in-up" delay={200 + index * 100}>
                  <div className="branch-card">
                    <div className="branch-header">
                      <div className="branch-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                      </div>
                      <h2 className="branch-city">{address.city}</h2>
                    </div>
                    <p className="branch-address">{address.fullAddress}</p>
                    {mapSrc ? (
                      <div className="branch-map">
                        <iframe
                          src={mapSrc}
                          width="100%"
                          height="200"
                          style={{ border: 0, borderRadius: '12px' }}
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title={`خريطة ${address.city}`}
                        />
                      </div>
                    ) : null}
                  </div>
                </AnimatedSection>
                );
              })}
              {!data?.addresses?.length && (
                <div className="locations-empty">لا توجد فروع متاحة حالياً</div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default LocationsPage;