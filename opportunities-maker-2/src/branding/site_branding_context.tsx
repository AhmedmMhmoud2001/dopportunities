import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { apiRequest, resolvePublicAssetUrl } from '../lib/api';

type SiteBrandingApi = {
  headerLogoUrl?: string | null;
  footerLogoUrl?: string | null;
};

export type SiteBrandingValue = {
  headerLogoResolved: string | null;
  footerLogoResolved: string | null;
  loading: boolean;
};

const SiteBrandingContext = createContext<SiteBrandingValue>({
  headerLogoResolved: null,
  footerLogoResolved: null,
  loading: true,
});

export function SiteBrandingProvider({ children }: { children: ReactNode }) {
  const [headerLogoResolved, setHeaderLogoResolved] = useState<string | null>(null);
  const [footerLogoResolved, setFooterLogoResolved] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiRequest<SiteBrandingApi>('/v1/site-branding', { cache: 'no-store' });
        const h = data?.headerLogoUrl?.trim();
        const f = data?.footerLogoUrl?.trim();
        if (!cancelled) {
          setHeaderLogoResolved(h ? resolvePublicAssetUrl(h) : null);
          setFooterLogoResolved(f ? resolvePublicAssetUrl(f) : null);
        }
      } catch {
        if (!cancelled) {
          setHeaderLogoResolved(null);
          setFooterLogoResolved(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({ headerLogoResolved, footerLogoResolved, loading }),
    [headerLogoResolved, footerLogoResolved, loading],
  );

  return <SiteBrandingContext.Provider value={value}>{children}</SiteBrandingContext.Provider>;
}

export function useSiteBranding(): SiteBrandingValue {
  return useContext(SiteBrandingContext);
}
