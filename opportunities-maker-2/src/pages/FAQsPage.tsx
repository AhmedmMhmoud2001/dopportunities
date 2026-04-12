import { useEffect, useState } from 'react';
import './FAQsPage.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AnimatedSection from '../components/AnimatedSection';
import { apiRequest } from '../lib/api';
import { MAIN_NAV_ITEMS } from '../config/mainNav';

function FAQsPage() {
  const handleRegisterClick = () => {
    // معالجة النقر على زر التسجيل
  };

  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [faqs, setFaqs] = useState<Array<{ id: number; question: string; answer: string }>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        const data = await apiRequest<Array<{ id: number; question: string; answer: string }>>(
          '/v1/faqs'
        );
        if (!ignore) {
          setFaqs(data);
          setError(null);
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Failed to load FAQs';
        if (!ignore) setError(message);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faqs-page">
      <Header 
        navItems={MAIN_NAV_ITEMS}
        registerButtonText="سجل الآن"
        onRegisterClick={handleRegisterClick}
      />
      
      <main className="faqs-page-content page-enter">
        <div className="container">
          <AnimatedSection animationType="fade-in-down" delay={0}>
            <h1 className="faqs-page-title">الأسئلة المتكررة</h1>
          </AnimatedSection>

          {loading && (
            <div className="faqs-loading">جاري التحميل...</div>
          )}
          {error && (
            <div className="faqs-error" role="alert">حدث خطأ أثناء تحميل الأسئلة: {error}</div>
          )}
          
          {!loading && !error && (
          <div className="faqs-list">
            {faqs.map((faq, index) => (
              <AnimatedSection 
                key={faq.id ?? index} 
                animationType="fade-in-up" 
                delay={index * 100}
              >
                <div className={`faq-item ${openIndex === index ? 'open' : ''}`}>
                <button 
                  className="faq-question"
                  onClick={() => toggleFAQ(index)}
                  aria-expanded={openIndex === index}
                >
                  <span className="faq-question-text">{faq.question}</span>
                  <span className="faq-icon">
                    <svg 
                      width="24" 
                      height="24" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        d={openIndex === index ? "M18 15L12 9L6 15" : "M6 9L12 15L18 9"} 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </button>
                {openIndex === index && (
                  <div className="faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                )}
                </div>
              </AnimatedSection>
            ))}
          </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default FAQsPage;

