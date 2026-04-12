import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TermsPage.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AnimatedSection from '../components/AnimatedSection';
import { apiRequest } from '../lib/api';
import { MAIN_NAV_ITEMS } from '../config/mainNav';

interface TermsPayload {
  title?: string;
  content?: string;
  version?: string;
  updatedAt?: string;
}

function TermsPage() {
  const navigate = useNavigate();
  const [terms, setTerms] = useState<TermsPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiRequest<TermsPayload>('/v1/terms', { cache: 'no-store' });
        if (!cancelled) {
          setTerms(data);
          setError(null);
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : 'تعذّر تحميل الشروط والأحكام';
        if (!cancelled) setError(message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="terms-page">
      <Header
        navItems={MAIN_NAV_ITEMS}
        registerButtonText="سجل الآن"
        onRegisterClick={() => navigate('/signup')}
      />

      <main className="terms-page-content page-enter">
        <div className="container">
          <AnimatedSection animationType="fade-in-down" delay={0}>
            {isLoading ? (
              <p className="terms-page-status">جارٍ التحميل…</p>
            ) : error ? (
              <p className="terms-page-error">{error}</p>
            ) : (
              <article className="terms-card">
                <header className="terms-card-header">
                  <h1 className="terms-card-title">{terms?.title ?? 'الشروط والأحكام'}</h1>
                  {terms?.version ? (
                    <span className="terms-card-version">الإصدار {terms.version}</span>
                  ) : null}
                </header>
                <div className="terms-card-body terms-card-body--plain">
                  {terms?.content?.trim()
                    ? terms.content
                    : 'لا يوجد محتوى متاح حالياً.'}
                </div>
                <footer className="terms-card-footer">
                  <p className="terms-card-updated">
                    آخر تحديث:{' '}
                    {terms?.updatedAt
                      ? new Date(terms.updatedAt).toLocaleDateString('ar-SA', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : '—'}
                  </p>
                </footer>
              </article>
            )}
          </AnimatedSection>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default TermsPage;
