import { useEffect, useMemo, useState } from 'react';
import './ConsultantSection.css';
import consultantFallback from '../assets/images/consultant.png';
import AnimatedSection from './AnimatedSection';
import { apiRequest, resolvePublicAssetUrl } from '../lib/api';

const DEFAULT_ROLE = 'CEO';
const DEFAULT_HEADING = '# المستشار أنور علي';
const DEFAULT_BIO =
  'متخصص في تأسيس الشركات وقد أسست أكثر من 400+ شركة في عمان والسعودية وبرأس مال أجنبي 100% خلال مدة إنجاز تتراوح بين 30 إلى 60 يوم عمل ولدي من الخبرة ما يؤهلني لتجاوز أي عقبات في مرحلة تأسيس الشركة وأحمل عنك هم ذلك وأسلمك لك أوراق شركتك جاهزة دون عناء مع فريق عملي المتناهي وفروعي في السعودية وسلطنة عمان.';

function ConsultantSection() {
  const [consultantRole, setConsultantRole] = useState(DEFAULT_ROLE);
  const [consultantHeading, setConsultantHeading] = useState(DEFAULT_HEADING);
  const [consultantBio, setConsultantBio] = useState(DEFAULT_BIO);
  const [consultantImageUrl, setConsultantImageUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiRequest<{
          consultantRole?: string;
          consultantHeading?: string;
          consultantBio?: string;
          consultantImageUrl?: string | null;
        }>('/v1/home-work-consultant');
        if (cancelled) return;
        if (res?.consultantRole != null) setConsultantRole(res.consultantRole);
        if (res?.consultantHeading != null) setConsultantHeading(res.consultantHeading);
        if (res?.consultantBio != null) setConsultantBio(res.consultantBio);
        setConsultantImageUrl(
          res?.consultantImageUrl?.trim() ? res.consultantImageUrl.trim() : null,
        );
      } catch {
        /* defaults */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const imageSrc = useMemo(() => {
    if (consultantImageUrl) return resolvePublicAssetUrl(consultantImageUrl);
    return consultantFallback;
  }, [consultantImageUrl]);

  return (
    <section className="consultant-section">
      <div className="container">
        <div className="consultant-content">
          <div className="consultant-image">
            <AnimatedSection animationType="zoom-in" delay={0}>
              
                <img 
                  src={imageSrc} 
                  alt="" 
                  className="consultant-img hover-scale"
                />
              
            </AnimatedSection>
          </div>
          
          <AnimatedSection animationType="fade-in-left" delay={200}>
            <div className="consultant-text">
              <AnimatedSection animationType="fade-in-down" delay={400}>
                <div className="consultant-title-wrapper">
                  <h2 className="consultant-title">{consultantHeading}</h2>
                  <span className="consultant-role">{consultantRole}</span>
                </div>
              </AnimatedSection>
              <AnimatedSection animationType="fade-in-up" delay={600}>
                <p className="consultant-description full-width">
                  {consultantBio}
                </p>
              </AnimatedSection>
            </div>  
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}

export default ConsultantSection;
