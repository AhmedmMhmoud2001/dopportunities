import { useEffect, useState } from 'react';
import './TestimonialsSection.css';
import AnimatedSection from './AnimatedSection';
import { apiRequest, resolvePublicAssetUrl } from '../lib/api';

const DEFAULT_SECTION_TITLE = '# آراء عملائنا';
const DEFAULT_SECTION_DESCRIPTION =
  'لوريم ايبسوم دولار سيت أميت إنفيدونت كويس سيت لامبور نوسترو أيت سيت إنتروليكيشن كونسيكوات. ايبسوم أليكويب أيت كويرات بيريتيتيس. ليجاتوس سيت توب فوليتيات. إيليت، دولار تيت ليجاتوس لابوري لامبور كويرات. ارينتي لابوريس دونك،';

function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Array<{ id: number; name: string; quote?: string; text: string; imageUrl?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sectionTitle, setSectionTitle] = useState(DEFAULT_SECTION_TITLE);
  const [sectionDescription, setSectionDescription] = useState(DEFAULT_SECTION_DESCRIPTION);

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await apiRequest<Array<{ id: number; name: string; quote?: string; text: string; imageUrl?: string }>>('/v1/testimonials');
        if (mounted) {
          setTestimonials(Array.isArray(data) ? data : []);
          setCurrentIndex(0);
        }
      } catch (err: any) {
        if (mounted) setError(err?.message || 'Failed to load testimonials');
      } finally {
        if (mounted) setLoading(false);
      }
      try {
        const section = await apiRequest<{ sectionTitle?: string; sectionDescription?: string }>('/v1/testimonials/section', {
          cache: 'no-store',
        });
        if (!mounted || !section) return;
        if (typeof section.sectionTitle === 'string' && section.sectionTitle.trim()) {
          setSectionTitle(section.sectionTitle.trim());
        }
        if (typeof section.sectionDescription === 'string') {
          setSectionDescription(section.sectionDescription);
        }
      } catch {
        /* يبقى العنوان والوصف الافتراضيان */
      }
    })();
    return () => { mounted = false; };
  }, []);

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      testimonials.length ? (prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1) : 0
    );
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      testimonials.length ? (prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1) : 0
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <section className="testimonials-section" id="testimonials">
      <div className="container">
        <div className="testimonials-content">
          <AnimatedSection animationType="fade-in-right" delay={0}>
            <div className="testimonials-text">
              <h2 className="testimonials-title">{sectionTitle}</h2>
              <p className="testimonials-description">{sectionDescription}</p>
            </div>
          </AnimatedSection>
          <div className="testimonials-cards">
            {error ? (
              <div style={{ color: '#b91c1c', fontWeight: 700, padding: 12 }}>تعذر تحميل الآراء</div>
            ) : null}
            <div className="testimonials-slider">
              {loading ? (
                <div style={{ color: '#64748b', padding: 12 }}>جاري التحميل…</div>
              ) : (
                <div 
                  className="testimonials-track animate-smooth"
                  style={{ transform: `translateX(${currentIndex * 100}%)` }}
                >
                  {testimonials.map((t, index) => (
                    <div key={t.id ?? index} className="testimonial-card">
                      <div className="testimonial-header">
                        {t.imageUrl ? (
                          <div className="testimonial-avatar">
                            <img src={resolvePublicAssetUrl(t.imageUrl)} alt={t.name} className="avatar-img hover-scale" />
                          </div>
                        ) : null}
                        <p className="testimonial-name">{t.name}</p>
                      </div>
                      <div className="testimonial-content">
                        {t.quote ? <p className="testimonial-quote">{t.quote}</p> : null}
                        <p className="testimonial-text">{t.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button 
                className="slider-button slider-button-prev"
                onClick={goToPrevious}
                aria-label="Previous testimonial"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button 
                className="slider-button slider-button-next"
                onClick={goToNext}
                aria-label="Next testimonial"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <div className="testimonials-indicators">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`indicator-dot ${index === currentIndex ? 'active' : ''}`}
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;
export { TestimonialsSection };