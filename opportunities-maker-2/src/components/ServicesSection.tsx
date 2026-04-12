import './ServicesSection.css';
import AnimatedSection from './AnimatedSection';
import { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';

function ServicesSection() {
  const [services, setServices] = useState<Array<{ id: number; title: string; slug: string; imageUrl?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await apiRequest<Array<{ id: number; title: string; slug: string; imageUrl?: string }>>('/v1/services');
        if (mounted) setServices(Array.isArray(data) ? data : []);
      } catch (err: any) {
        if (mounted) setError(err?.message || 'Failed to load services');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <section className="services-section">
      <div className="container">
        <div className="services-content">
          <AnimatedSection animationType="fade-in-down" delay={0}>
            <h2 className="services-title"># خدماتنا</h2>
          </AnimatedSection>
          {error ? (
            <div style={{ color: '#b91c1c', fontWeight: 700, padding: 12 }}>تعذر تحميل الخدمات</div>
          ) : null}
          {loading ? (
            <AnimatedSection animationType="fade-in-up" delay={200}>
              <div className="service-card hover-lift">
                <div className="service-icon"></div>
                <p className="service-text">جاري التحميل…</p>
              </div>
            </AnimatedSection>
          ) : (
            services.map((svc, idx) => (
              <AnimatedSection key={svc.id ?? idx} animationType="fade-in-up" delay={100 + idx * 100}>
                <div className="service-card hover-lift">
                  <div className="service-icon">{/* optional icon */}</div>
                  <p className="service-text">{svc.title}</p>
                </div>
              </AnimatedSection>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export default ServicesSection;
