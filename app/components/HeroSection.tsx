'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { TOOLS, CATEGORIES } from '../lib/tools';

const FEATURED_SLUGS = ['merge/pdf', 'compress', 'pdf-to-image', 'remove-background', 'ocr', 'watermark'];

const TRUST_ITEMS = [
  { icon: '🔒', label: 'Secure processing' },
  { icon: '⚡', label: 'Instant results' },
  { icon: '🆓', label: 'No sign-up' },
];

export function HeroSection() {
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const totalTools = TOOLS.length;
  const featuredTools = useMemo(
    () => FEATURED_SLUGS.map((slug) => TOOLS.find((t) => t.slug === slug)).filter(Boolean),
    [],
  );

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return TOOLS.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.slug.includes(q),
    ).slice(0, 6);
  }, [query]);

  return (
    <section className="hero-section relative overflow-hidden">
      {/* Background layers */}
      <div className="hero-mesh absolute inset-0 pointer-events-none" />
      <div className="hero-grid absolute inset-0 pointer-events-none opacity-[0.35]" />
      <div className="hero-orb hero-orb-1 absolute pointer-events-none" />
      <div className="hero-orb hero-orb-2 absolute pointer-events-none" />
      <div className="hero-orb hero-orb-3 absolute pointer-events-none" />

      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 pt-10 pb-12 lg:pt-14 lg:pb-16">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-12 items-center">

          {/* Left — copy & actions */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] mb-6 hero-badge">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Free · No sign-up · Instant download
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.35rem] font-black text-white leading-[1.08] tracking-tight mb-5">
              Transform Any{' '}
              <span className="hero-gradient-text">PDF or Image</span>
              <br className="hidden sm:block" />
              {' '}in Seconds
            </h1>

            <p className="text-base sm:text-lg max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed" style={{ color: '#94a3b8' }}>
              Merge, compress, convert, OCR, watermark, remove backgrounds and more —
              {totalTools}+ professional tools, 100% free forever.
            </p>

            {/* Search */}
            <div className="relative max-w-xl mx-auto lg:mx-0 mb-6">
              <div className="hero-search flex items-center gap-3 px-4 py-3.5 rounded-2xl">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSearchOpen(true);
                  }}
                  onFocus={() => setSearchOpen(true)}
                  onBlur={() => setTimeout(() => setSearchOpen(false), 180)}
                  placeholder="Search tools — merge pdf, compress, ocr…"
                  className="flex-1 bg-transparent text-sm sm:text-base text-white placeholder:text-slate-500 outline-none min-w-0"
                />
                <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold text-slate-400 bg-white/5 border border-white/10">
                  ⌘K
                </kbd>
              </div>

              {searchOpen && searchResults.length > 0 && (
                <div className="absolute top-[calc(100%+8px)] left-0 right-0 rounded-2xl overflow-hidden z-30 hero-search-dropdown">
                  {searchResults.map((tool) => (
                    <Link
                      key={tool.slug}
                      href={`/tool/${tool.slug}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0"
                        style={{ background: tool.bgColor }}
                      >
                        {tool.icon}
                      </div>
                      <div className="min-w-0 text-left">
                        <p className="text-sm font-bold text-white truncate">{tool.name}</p>
                        <p className="text-xs text-slate-400 truncate">{tool.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mb-8">
              <a
                href="#pdf-section"
                className="hero-cta-primary inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold text-white w-full sm:w-auto"
              >
                Browse All Tools
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <Link
                href="/tool/merge/pdf"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold w-full sm:w-auto hero-cta-secondary"
              >
                <span>🔀</span> Merge PDF — Most Popularsss
              </Link>
            </div>

            {/* Trust pills */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
              {TRUST_ITEMS.map((item) => (
                <span
                  key={item.label}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-300 bg-white/[0.06] border border-white/[0.08]"
                >
                  <span>{item.icon}</span>
                  {item.label}
                </span>
              ))}
            </div>
          </div>

          {/* Right — bento tool showcase */}
          <div className="relative hidden sm:block">
            <div className="hero-bento relative rounded-[1.75rem] p-5 sm:p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Popular tools</p>
                  <p className="text-sm font-semibold text-white">Pick one and start instantly</p>
                </div>
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-400/80" />
                  <span className="w-3 h-3 rounded-full bg-amber-400/80" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400/80" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {featuredTools.map((tool, i) => (
                  <Link
                    key={tool!.slug}
                    href={`/tool/${tool!.slug}`}
                    className={`hero-tool-card group flex flex-col gap-2 p-3.5 rounded-2xl transition-all duration-300 hover:-translate-y-1 ${i === 0 ? 'col-span-2 sm:col-span-1' : ''}`}
                    style={{
                      animationDelay: `${i * 0.12}s`,
                      borderColor: `${tool!.borderColor}55`,
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-transform duration-300 group-hover:scale-110"
                      style={{ background: tool!.bgColor }}
                    >
                      {tool!.icon}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white leading-tight">{tool!.name}</p>
                      <p className="text-[11px] text-slate-400 leading-snug mt-0.5 line-clamp-2">{tool!.description}</p>
                    </div>
                    <span
                      className="text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity mt-auto"
                      style={{ color: tool!.color }}
                    >
                      Open tool →
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Floating accent card */}
            <div className="hero-float-card absolute -bottom-4 -left-4 lg:-left-8 px-4 py-3 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg bg-emerald-500/20 border border-emerald-400/30">
                ✓
              </div>
              <div>
                <p className="text-xs font-bold text-white">Ready in seconds</p>
                <p className="text-[11px] text-slate-400">Upload → Process → Download</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-10 lg:mt-14 max-w-3xl lg:max-w-none">
          {[
            { value: `${totalTools}+`, label: 'Free Tools', accent: '#7dd3fc' },
            { value: String(CATEGORIES.length), label: 'Categories', accent: '#a78bfa' },
            { value: '100%', label: 'Free Forever', accent: '#6ee7b7' },
          ].map((stat) => (
            <div key={stat.label} className="hero-stat-card text-center px-3 py-4 sm:py-5 rounded-2xl">
              <div className="text-2xl sm:text-3xl font-black text-white">{stat.value}</div>
              <div className="text-[11px] sm:text-xs font-semibold mt-1" style={{ color: stat.accent }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
