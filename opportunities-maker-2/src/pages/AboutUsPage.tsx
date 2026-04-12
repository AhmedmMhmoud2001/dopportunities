import './AboutUsPage.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import logoImage from '../assets/images/logo.png';
import consultantAvatarImage from '../assets/images/anwer_ali.png';
import AnimatedSection from '../components/AnimatedSection';
import { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';
import { MAIN_NAV_ITEMS } from '../config/mainNav';

function AboutUsPage() {
  const [aboutTitle, setAboutTitle] = useState<string>('');
  const [aboutContent, setAboutContent] = useState<string>('');
  const [companyTitle, setCompanyTitle] = useState<string>('شركة صناع الفرص');
  const [companyContent, setCompanyContent] = useState<string>('');
  const [missionTitle, setMissionTitle] = useState<string>('مهمتنا');
  const [missionContent, setMissionContent] = useState<string>('');
  const [visionTitle, setVisionTitle] = useState<string>('رؤيتنا');
  const [visionContent, setVisionContent] = useState<string>('');
  const [consultantTitle, setConsultantTitle] = useState<string>('المستشار أنور علي');
  const [consultantContent, setConsultantContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        // Load multiple content blocks (public)
        const slugs = ['about', 'about_company', 'about_mission', 'about_vision', 'about_consultant'];
        const results = await Promise.all(
          slugs.map(async (slug) => {
            try {
              return await apiRequest<{ id: number; slug: string; title: string; content: string }>(`/v1/pages/${slug}`);
            } catch {
              return null;
            }
          }),
        );
        const [about, company, mission, vision, consultant] = results;
        if (mounted && about) {
          setAboutTitle(about.title || '');
          setAboutContent(about.content || '');
        }
        if (mounted && company) {
          setCompanyTitle(company.title || 'شركة صناع الفرص');
          setCompanyContent(company.content || '');
        }
        if (mounted && mission) {
          setMissionTitle(mission.title || 'مهمتنا');
          setMissionContent(mission.content || '');
        }
        if (mounted && vision) {
          setVisionTitle(vision.title || 'رؤيتنا');
          setVisionContent(vision.content || '');
        }
        if (mounted && consultant) {
          setConsultantTitle(consultant.title || 'المستشار أنور علي');
          setConsultantContent(consultant.content || '');
        }
      } catch (err: any) {
        if (mounted) setLoadError(err?.message || 'فشل تحميل صفحة "من نحن"');
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleRegisterClick = () => {
    // معالجة النقر على زر التسجيل
  };

  return (
    <div className="about-us-page">
      <Header 
        navItems={MAIN_NAV_ITEMS}
        registerButtonText="سجل الآن"
        onRegisterClick={handleRegisterClick}
      />
      
      <main className="about-us-content page-enter">
        <div className="container">
          {/* Header Section with Logo */}
          <AnimatedSection animationType="fade-in-down" delay={0}>
            <div className="about-header">
              <div className="about-logo">
                <img src={logoImage} alt="Opportunities Makers Logo" />
              </div>
            </div>
          </AnimatedSection>

          {/* Managed content from Dashboard (slug: about) */}
          <AnimatedSection animationType="fade-in-up" delay={50}>
            <div className="about-card" style={{ marginTop: 12 }}>
              {isLoading ? (
                <p className="about-card-text" style={{ opacity: 0.75 }}>جاري التحميل…</p>
              ) : loadError ? (
                <p className="about-card-text" style={{ color: '#b91c1c', fontWeight: 700 }}>{loadError}</p>
              ) : aboutTitle || aboutContent ? (
                <div>
                  {aboutTitle ? <h2 className="about-card-title">{aboutTitle}</h2> : null}
                  {aboutContent ? (
                    <p className="about-card-text" style={{ whiteSpace: 'pre-wrap' }}>{aboutContent}</p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </AnimatedSection>

          {/* Top Content Block - Mission, Vision, and Company Info */}
          <div className="about-top-section">
            <AnimatedSection animationType="fade-in-right" delay={100}>
              <div className="about-left-column">
                <div className="about-card company-card">
                  <div className="about-card-background"></div>
                  {companyTitle ? <h3 className="about-card-title bg">{companyTitle}</h3> : null}
                  {companyContent ? <p className="about-card-text bg" style={{ whiteSpace: 'pre-wrap' }}>{companyContent}</p> : null}
                </div>
              </div>
            </AnimatedSection>
            <AnimatedSection animationType="fade-in-left" delay={200}>
              <div className="about-left-column">
                <AnimatedSection animationType="scale-in" delay={300}>
                  <div className="about-card mission-card">
                    {missionTitle ? <h3 className="about-card-title">{missionTitle}</h3> : null}
                    {missionContent ? <p className="about-card-text" style={{ whiteSpace: 'pre-wrap' }}>{missionContent}</p> : null}
                  </div>
                </AnimatedSection>
                
                <AnimatedSection animationType="scale-in" delay={400}>
                  <div className="about-card vision-card">
                    {visionTitle ? <h3 className="about-card-title">{visionTitle}</h3> : null}
                    {visionContent ? <p className="about-card-text" style={{ whiteSpace: 'pre-wrap' }}>{visionContent}</p> : null}
                  </div>
                </AnimatedSection>
              </div>
            </AnimatedSection>
          </div>

          {/* Bottom Content Block - Consultant Info */}
          <AnimatedSection animationType="fade-in-up" delay={200}>
            <div className="about-bottom-section">
              <div className="consultant-banner">
                <AnimatedSection animationType="zoom-in" delay={300}>
                  <div className="consultant-banner-content">
                    <div className="consultant-banner-image">
                      <img src={consultantAvatarImage} alt="المستشار أنور علي" className="consultant-banner-avatar" />
                    </div>
                    {consultantTitle ? <h3 className="consultant-banner-title">{consultantTitle}</h3> : null}
                  </div>
                </AnimatedSection>
                <AnimatedSection animationType="fade-in-up" delay={400}>
                  <div className="consultant-banner-text">
                    {consultantContent ? (
                      <p className="about-card-text consultant-text" style={{ whiteSpace: 'pre-wrap' }}>
                        {consultantContent}
                      </p>
                    ) : null}
                  </div>
                </AnimatedSection>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default AboutUsPage;

