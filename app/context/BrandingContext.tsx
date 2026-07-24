'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

export type SiteBranding = {
  headerLogo: string;
  footerLogo: string;
};

const DEFAULTS: SiteBranding = {
  headerLogo: '/Website_logo_1.2-RB.png',
  footerLogo: '/Website_logo_1.2-RB.png',
};

type BrandingCtx = {
  branding: SiteBranding;
  loading: boolean;
  refresh: () => Promise<void>;
  setBrandingLocal: (next: SiteBranding) => void;
};

const BrandingContext = createContext<BrandingCtx | null>(null);

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<SiteBranding>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/site-branding', { cache: 'no-store' });
      if (res.ok) {
        const data = (await res.json()) as Partial<SiteBranding>;
        setBranding({
          headerLogo: data.headerLogo || DEFAULTS.headerLogo,
          footerLogo: data.footerLogo || DEFAULTS.footerLogo,
        });
      }
    } catch {
      /* keep defaults */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const setBrandingLocal = useCallback((next: SiteBranding) => {
    setBranding(next);
  }, []);

  return (
    <BrandingContext.Provider value={{ branding, loading, refresh, setBrandingLocal }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useSiteBranding(): BrandingCtx {
  const ctx = useContext(BrandingContext);
  if (!ctx) {
    return {
      branding: DEFAULTS,
      loading: false,
      refresh: async () => undefined,
      setBrandingLocal: () => undefined,
    };
  }
  return ctx;
}
