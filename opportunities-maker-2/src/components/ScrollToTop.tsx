import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** عند تغيير المسار: تمرير للأعلى، أو إلى عنصر الـ id عند وجود hash (مثل /#testimonials). */
export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace(/^#/, '');
      if (id) {
        const run = () => {
          document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        };
        requestAnimationFrame(run);
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}
