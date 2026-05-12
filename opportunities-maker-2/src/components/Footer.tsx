import { useEffect, useState } from 'react';
import './Footer.css';
import { Link } from 'react-router-dom';
import type { To } from 'react-router-dom';
import logoImage from '../assets/images/logo_footer.png';
import { apiRequest } from '../lib/api';
import { useSiteBranding } from '../branding/site_branding_context';

type SocialKey = 'twitter' | 'instagram' | 'youtube' | 'facebook' | 'linkedin' | 'tiktok';

type SocialPayload = Partial<Record<SocialKey, string | null | undefined>>;

/** عند عدم وجود رابط في الـ API */
const FALLBACK: Partial<Record<SocialKey, string>> = {
  twitter: 'https://twitter.com',
  instagram: 'https://instagram.com',
  youtube: 'https://youtube.com',
  facebook: 'https://facebook.com',
};

function resolveHref(
  key: SocialKey,
  api: SocialPayload | null,
  useFallback: boolean,
): string | null {
  const v = api?.[key]?.trim();
  if (v) return v;
  if (useFallback) return FALLBACK[key] ?? null;
  return null;
}

const SOCIAL_ORDER: { key: SocialKey; label: string; useFallback: boolean }[] = [
  { key: 'twitter', label: 'Twitter', useFallback: true },
  { key: 'instagram', label: 'Instagram', useFallback: true },
  { key: 'youtube', label: 'YouTube', useFallback: true },
  { key: 'facebook', label: 'Facebook', useFallback: true },
  { key: 'linkedin', label: 'LinkedIn', useFallback: false },
  { key: 'tiktok', label: 'TikTok', useFallback: false },
];

function SocialIcon({ socialKey }: { socialKey: SocialKey }) {
  switch (socialKey) {
    case 'twitter':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="white" />
        </svg>
      );
    case 'instagram':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" fill="white" />
        </svg>
      );
    case 'youtube':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="white" />
        </svg>
      );
    case 'facebook':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="white" />
        </svg>
      );
    case 'linkedin':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill="white" />
        </svg>
      );
    case 'tiktok':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" fill="white" />
        </svg>
      );
    default:
      return null;
  }
}

function Footer() {
  const [social, setSocial] = useState<SocialPayload | null>(null);
  const { footerLogoResolved } = useSiteBranding();
  const footerLogoSrc = footerLogoResolved ?? logoImage;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiRequest<SocialPayload>('/v1/footer-social', { cache: 'no-store' });
        if (!cancelled && data && typeof data === 'object') setSocial(data);
      } catch {
        if (!cancelled) setSocial({});
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const quickLinks: { label: string; to: To }[] = [
    { label: 'معلومات عنا', to: '/about' },
    { label: 'الخدمات', to: '/services' },
    { label: 'التأمين', to: '/contact' },
    { label: 'شهادة تقدير', to: { pathname: '/', hash: 'testimonials' } },
  ];

  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="container">
          <div className="footer-content">
            <div className="footer-column footer-contact">
              <h3 className="footer-title">اتصل بنا</h3>
              <div className="footer-contact-info">
                <div className="contact-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="white" />
                  </svg>
                  <a href="mailto:hello@website.com" className="footer-contact-link">
                    hello@website.com
                  </a>
                </div>
                <div className="contact-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="white" />
                  </svg>
                  <span>شارع زيد بن ثابت, حي الملز, بناء رقم 56, الدور الاول, مكتب رقم 8, الرياض, المملكة العربية السعودية.</span>
                </div>
                <div className="contact-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" fill="white" />
                  </svg>
                  <a href="tel:+966920032165" className="footer-contact-link">
                    9200 321 65
                  </a>
                </div>
              </div>
            </div>

            <div className="footer-column footer-links-column">
              <h3 className="footer-title">روابط سريعة</h3>
              <nav className="footer-nav">
                <ul className="footer-links-list">
                  {quickLinks.map((link) => (
                    <li key={link.label}>
                      <Link to={link.to} className="footer-link">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            <div className="footer-column footer-about">
              <div className="footer-logo">
                <img src={footerLogoSrc} alt="Logo" />
              </div>
              <p className="footer-description">
                اللغات الأوروبية هي أعضاء في نفس العائلة. وجودها المنفصل هو أسطورة. بالنسبة للعلوم والموسيقى والرياضة، تستخدم أوروبا الصغيرة نفس المفردات. اللغات تختلف فقط في.
              </p>
              <div className="footer-social">
                {SOCIAL_ORDER.map(({ key, label, useFallback }) => {
                  const href = resolveHref(key, social, useFallback);
                  if (!href) return null;
                  const activeClass = key === 'facebook' ? ' social-icon-active' : '';
                  return (
                    <a
                      key={key}
                      href={href}
                      className={`social-icon${activeClass}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                    >
                      <SocialIcon socialKey={key} />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p className="footer-copyright">جميع الحقوق محفوظة هذه هى شركتك 2023 &copy;.</p>
      </div>
    </footer>
  );
}

export default Footer;
