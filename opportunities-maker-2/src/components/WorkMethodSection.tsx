import { useEffect, useState } from 'react';
import './WorkMethodSection.css';
import AnimatedSection from './AnimatedSection';
import { apiRequest } from '../lib/api';

const DEFAULT_TITLE = '# طريقة عملنا';
const DEFAULT_SUBTITLE =
  'لوريم ايبسوم دولار سيت أميت سيت كويرات كونسيفيكات كويرات. لابوري دونك، ني';
const DEFAULT_STEP =
  'لوريم ايبسوم دولار سيت أميت يوت إنكيديديونت أد إكزيرسيتيشن ك';

function WorkMethodSection() {
  const [workTitle, setWorkTitle] = useState(DEFAULT_TITLE);
  const [workSubtitle, setWorkSubtitle] = useState(DEFAULT_SUBTITLE);
  const [stepTexts, setStepTexts] = useState<[string, string, string]>([
    DEFAULT_STEP,
    DEFAULT_STEP,
    DEFAULT_STEP,
  ]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiRequest<{
          workTitle?: string;
          workSubtitle?: string;
          step1Text?: string;
          step2Text?: string;
          step3Text?: string;
        }>('/v1/home-work-consultant');
        if (cancelled) return;
        if (res?.workTitle) setWorkTitle(res.workTitle);
        if (res?.workSubtitle != null) setWorkSubtitle(res.workSubtitle);
        setStepTexts([
          res?.step1Text ?? DEFAULT_STEP,
          res?.step2Text ?? DEFAULT_STEP,
          res?.step3Text ?? DEFAULT_STEP,
        ]);
      } catch {
        /* defaults */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const steps = stepTexts.map((description, index) => ({
    number: String(index + 1),
    description,
  }));

  return (
    <section className="work-method-section">
      {/* <div className="container"> */}
        <div className="work-method-content">
          <AnimatedSection animationType="fade-in-down" delay={0} className="work-method-intro-wrap">
            <div className="work-method-header">
              <h2 className="work-method-title">{workTitle}</h2>
              <p className="work-method-subtitle">{workSubtitle}</p>
            </div>
          </AnimatedSection>
          <div className="work-method-steps">
            <div className="steps-container">
              {steps.map((step, index) => (
                <AnimatedSection 
                  key={index} 
                  animationType="fade-in-up" 
                  delay={index * 200}
                >
                  <div className="step-card hover-lift">
                    <div className="step-number-wrapper">
                      <div className="step-number-circle">
                        <span className="step-number">{step.number}</span>
                      </div>
                    </div>
                    <p className="step-description">{step.description}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      {/* </div> */}
    </section>
  );
}

export default WorkMethodSection;
