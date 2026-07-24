'use client';

import { AuthProvider } from '../context/AuthContext';
import { BrandingProvider } from '../context/BrandingContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <BrandingProvider>{children}</BrandingProvider>
    </AuthProvider>
  );
}
