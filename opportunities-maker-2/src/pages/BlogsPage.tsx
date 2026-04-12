import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './BlogsPage.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AnimatedSection from '../components/AnimatedSection';
import { MAIN_NAV_ITEMS } from '../config/mainNav';
import { apiRequest, resolvePublicAssetUrl } from '../lib/api';

const FALLBACK_CARD_IMAGE =
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop';

export interface BlogListItem {
  id: number;
  title: string;
  slug: string;
  content: string;
  author?: string | null;
  publishedAt?: string | null;
  imageUrl?: string | null;
}

function excerptFromContent(content: string, maxLen = 180): string {
  const t = content.replace(/\s+/g, ' ').trim();
  if (t.length <= maxLen) return t;
  return `${t.slice(0, maxLen).trim()}…`;
}

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

function BlogsPage() {
  const [articles, setArticles] = useState<BlogListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await apiRequest<BlogListItem[]>('/v1/blogs', { cache: 'no-store' });
        if (!cancelled) {
          setArticles(Array.isArray(list) ? list : []);
          setError(null);
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'تعذّر تحميل المقالات';
        if (!cancelled) setError(msg);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleRegisterClick = () => {};

  return (
    <div className="blogs-page">
      <Header
        navItems={MAIN_NAV_ITEMS}
        registerButtonText="سجل الآن"
        onRegisterClick={handleRegisterClick}
      />

      <main className="blogs-page-content page-enter">
        <div className="container">
          <AnimatedSection animationType="fade-in-down" delay={0}>
            <h1 className="blogs-page-title">المقالات</h1>
          </AnimatedSection>

          {isLoading ? (
            <p className="blogs-page-status">جارٍ التحميل…</p>
          ) : error ? (
            <p className="blogs-page-error">{error}</p>
          ) : articles.length === 0 ? (
            <p className="blogs-page-status">لا توجد مقالات حالياً.</p>
          ) : (
            <div className="blogs-grid">
              {articles.map((article, index) => {
                const img =
                  article.imageUrl?.trim() != null && article.imageUrl.trim() !== ''
                    ? resolvePublicAssetUrl(article.imageUrl.trim())
                    : FALLBACK_CARD_IMAGE;
                const readMin = estimateReadMinutesAr(article.content || '');
                return (
                  <AnimatedSection
                    key={article.id}
                    animationType="fade-in-up"
                    delay={(index % 3) * 100}
                  >
                    <article className="blog-card">
                      <div className="blog-image-wrapper">
                        <span className="read-time-badge">
                          {readMin} {readMin === 1 ? 'دقيقة قراءة' : 'دقائق قراءة'}
                        </span>
                        <img src={img} alt="" className="blog-image" />
                      </div>

                      <div className="blog-card-content">
                        <div className="blog-meta">
                          <span className="blog-author">
                            بقلم: {article.author?.trim() || '—'}
                          </span>
                          <span className="blog-date">
                            {formatBlogDate(article.publishedAt)}
                          </span>
                        </div>

                        <h2 className="blog-title">{article.title}</h2>

                        <p className="blog-description">
                          {excerptFromContent(article.content || '')}
                        </p>

                        <Link
                          to={`/blog/${encodeURIComponent(article.slug)}`}
                          className="blog-read-button"
                        >
                          قراءة
                        </Link>
                      </div>
                    </article>
                  </AnimatedSection>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default BlogsPage;
