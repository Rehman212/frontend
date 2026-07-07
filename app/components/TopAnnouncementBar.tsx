'use client';

import { useState } from 'react';

export function TopAnnouncementBar() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div
      className="relative border-b border-white/10"
      style={{ background: 'linear-gradient(90deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}
    >
      <div className="max-w-[1400px] mx-auto px-10 sm:px-12 py-2 flex items-center justify-center">
        <p className="text-[11px] sm:text-xs text-center text-slate-200 leading-snug pr-2">
          <span className="text-white font-semibold">100% free tools</span>
          {' '}— no signup, no subscription and private browser processing.
        </p>
      </div>

      <button
        type="button"
        onClick={() => setVisible(false)}
        aria-label="Dismiss announcement"
        className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
