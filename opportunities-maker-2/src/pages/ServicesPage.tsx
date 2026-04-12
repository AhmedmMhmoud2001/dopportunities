import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './ServicesPage.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AnimatedSection from '../components/AnimatedSection';
import { apiRequest, resolvePublicAssetUrl } from '../lib/api';
import { MAIN_NAV_ITEMS } from '../config/mainNav';

interface Service {
  id: number;
  title: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
}

function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchServices() {
      try {
        const data = await apiRequest<Service[]>('/v1/services');
        setServices(Array.isArray(data) ? data.filter((s: Service) => s.isActive) : []);
      } catch (err) {
        console.error('Failed to load services:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchServices();
  }, []);

  const handleRegisterClick = () => {
    // معالجة النقر على زر التسجيل
  };

  return (
    <div className="services-page">
      <Header 
        navItems={MAIN_NAV_ITEMS}
        registerButtonText="سجل الآن"
        onRegisterClick={handleRegisterClick}
      />
      
      <main className="services-page-content page-enter">
        <AnimatedSection animationType="fade-in-down" delay={0}>
          <div className="services-header">
            <h1 className="services-header-title">خدماتنا</h1>
          </div>
        </AnimatedSection>
        
        <AnimatedSection animationType="fade-in-up" delay={100}>
          <div className="services-main-card">
            <AnimatedSection animationType="fade-in-left" delay={200}>
              <div className="services-intro">
                <p className="services-intro-text">
                  نقدم خدمة تأسيس شركة أجنبية %100 في المملكة العربية السعودية عبر الاستحواذ على شركات دولية وكذلك تأسيس الشركات في سلطنة عمان. كما نعمل على التركيز على تقديم هذه الخدمتين فقط لنتميز عن غيرنا.
                </p>
              </div>
            </AnimatedSection>
            
            {isLoading ? (
              <div className="services-loading">جارٍ التحميل...</div>
            ) : services.length === 0 ? (
              <div className="services-empty">لا توجد خدمات متاحة حالياً</div>
            ) : (
              <div className="services-grid">
                {services.map((service, index) => (
                  <AnimatedSection key={service.id} animationType="fade-in-up" delay={300 + index * 100}>
                    <div className="service-card">
                      {service.imageUrl && (
                        <div className="service-card-image">
                          <img src={resolvePublicAssetUrl(service.imageUrl)} alt={service.title} />
                        </div>
                      )}
                      <div className="service-card-content">
                        <h3 className="service-card-title">{service.title}</h3>
                        <p className="service-card-description">{service.description}</p>
                        <Link to={`/contact`} className="service-card-button">
                          <span className="button-text">ابدأ الآن</span>
                          <div className="button-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M16 5v14l-11-7z" fill="currentColor"/>
                            </svg>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            )}
          </div>
        </AnimatedSection>
      </main>

      <Footer />
    </div>
  );
}

export default ServicesPage;