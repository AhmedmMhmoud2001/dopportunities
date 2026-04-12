import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './SingleBlogPage.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AnimatedSection from '../components/AnimatedSection';
import { MAIN_NAV_ITEMS } from '../config/mainNav';
import { apiRequest, resolvePublicAssetUrl } from '../lib/api';
import type { BlogListItem } from './BlogsPage';

const FALLBACK_HERO_IMAGE =
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop';

function estimateReadMinutesAr(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function formatBlogDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return '—';
  }
}

function SingleBlogPage() {
  const { slugOrId } = useParams<{ slugOrId: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<BlogListItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleRegisterClick = () => {};

  useEffect(() => {
    if (!slugOrId?.trim()) {
      setIsLoading(false);
      setArticle(null);
      setError(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await apiRequest<BlogListItem>(
          `/v1/blogs/${encodeURIComponent(slugOrId.trim())}`,
          { cache: 'no-store' },
        );
        if (!cancelled) {
          setArticle(data);
          setError(null);
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'تعذّر تحميل المقال';
        if (!cancelled) {
          setArticle(null);
          setError(msg);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slugOrId]);

  if (isLoading) {
    return (
      <div className="single-blog-page">
        <Header
          navItems={MAIN_NAV_ITEMS}
          registerButtonText="سجل الآن"
          onRegisterClick={handleRegisterClick}
        />
        <main className="single-blog-content">
          <div className="container">
            <p className="single-blog-status">جارٍ التحميل…</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="single-blog-page">
        <Header
          navItems={MAIN_NAV_ITEMS}
          registerButtonText="سجل الآن"
          onRegisterClick={handleRegisterClick}
        />
        <main className="single-blog-content">
          <div className="container">
            <p>{error || 'المدونة غير موجودة'}</p>
            <button type="button" onClick={() => navigate('/blogs')}>
              العودة إلى المدونات
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const readMin = estimateReadMinutesAr(article.content || '');
  const heroImg =
    article.imageUrl?.trim() != null && article.imageUrl.trim() !== ''
      ? resolvePublicAssetUrl(article.imageUrl.trim())
      : FALLBACK_HERO_IMAGE;

  return (
    <div className="single-blog-page">
      <Header
        navItems={MAIN_NAV_ITEMS}
        registerButtonText="سجل الآن"
        onRegisterClick={handleRegisterClick}
      />

      <main className="single-blog-content page-enter">
        <div className="container">
          <div className="single-blog-wrapper">
            <AnimatedSection animationType="zoom-in" delay={0}>
              <div className="blog-hero-image">
                <span className="read-time-badge">
                  {readMin} {readMin === 1 ? 'دقيقة قراءة' : 'دقائق قراءة'}
                </span>
                <img
                  src={heroImg}
                  alt=""
                  className="blog-hero-img"
                />
              </div>
            </AnimatedSection>

            <AnimatedSection animationType="fade-in-up" delay={100}>
              <div className="blog-content-section">
                <AnimatedSection animationType="fade-in-left" delay={200}>
                  <div className="blog-meta-info">
                    <span className="blog-meta-author">
                      بقلم: {article.author?.trim() || '—'}
                    </span>
                    <span className="blog-meta-date">
                      {formatBlogDate(article.publishedAt)}
                    </span>
                  </div>
                </AnimatedSection>

                <AnimatedSection animationType="fade-in-right" delay={300}>
                  <h1 className="blog-main-title">{article.title}</h1>
                </AnimatedSection>

                <div className="blog-full-content">
                  {(article.content || '')
                    .split(/\n\n+/)
                    .map((p) => p.trim())
                    .filter(Boolean)
                    .map((paragraph, index) => (
                      <AnimatedSection
                        key={index}
                        animationType="fade-in-up"
                        delay={400 + index * 100}
                      >
                        <p className="blog-paragraph">{paragraph}</p>
                      </AnimatedSection>
                    ))}
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default SingleBlogPage;
