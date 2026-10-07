'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const STORAGE_KEY = 'gdl_cookie_consent';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const choose = (value: 'accepted' | 'rejected') => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-[80] p-3 sm:p-4 pointer-events-none"
      role="dialog"
      aria-label="Cookie consent"
    >
      <div className="pointer-events-auto max-w-[1400px] mx-auto rounded-2xl border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.18)] px-4 py-4 sm:px-5 sm:py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
        <p className="text-[13px] text-slate-600 leading-relaxed flex-1">
          We use essential cookies to run the site. Analytics or advertising cookies are only used
          if you accept.{' '}
          <Link href="/cookie-policy" className="font-semibold text-[#2596be] hover:underline">
            Cookie Policy
          </Link>
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => choose('rejected')}
            className="px-3.5 py-2 rounded-lg text-xs font-bold text-slate-600 border border-slate-200 hover:bg-slate-50"
          >
            Reject non-essential
          </button>
          <button
            type="button"
            onClick={() => choose('accepted')}
            className="px-3.5 py-2 rounded-lg text-xs font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #2596be, #1e7ea1)' }}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
