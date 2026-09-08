import Link from 'next/link';

const TRUST_POINTS = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-5 h-5">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    title: 'Encrypted transfers',
    text: 'Every upload uses secure HTTPS encryption end to end.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-5 h-5">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14H6L5 6" />
        <path d="M10 11v6M14 11v6" />
        <path d="M9 6V4h6v2" />
      </svg>
    ),
    title: 'Auto file deletion',
    text: 'Processed files are removed from our servers automatically.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-5 h-5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: 'Private by design',
    text: 'We never share, sell or manually review your documents.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-5 h-5">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="17" y1="11" x2="22" y2="11" />
      </svg>
    ),
    title: 'No account required',
    text: 'Use any tool instantly — no sign-up means less data stored.',
  },
];

export function SecurityTrustCta() {
  return (
    <section className="relative py-14 sm:py-20 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 45%, #2596be 100%)' }}
      />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 80%, rgba(125,211,252,0.4), transparent 50%), radial-gradient(circle at 80% 20%, rgba(124,58,237,0.25), transparent 45%)',
        }}
      />

      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-14 items-center">
          {/* Left — message + CTA */}
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest text-[#7dd3fc] bg-white/10 border border-white/15 mb-5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Your files are safe
            </span>

            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight mb-4">
              Process PDFs &amp; Images{' '}
              <span className="text-[#7dd3fc]">With Confidence</span>
            </h2>

            <p className="text-base text-slate-300 leading-relaxed max-w-xl mb-8">
              We know your documents matter. That&apos;s why every file is handled with secure
              connections, private processing, and automatic cleanup — so you can focus on results,
              not worry.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/tool/merge/pdf"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold text-[#0f172a] bg-white hover:bg-slate-100 transition-all hover:-translate-y-0.5 shadow-lg shadow-black/20"
              >
                Try Securely — Free
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="#pdf-section"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold text-white border border-white/25 bg-white/5 hover:bg-white/10 transition-all"
              >
                Browse All Tools
              </Link>
            </div>
          </div>

          {/* Right — trust grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {TRUST_POINTS.map((point) => (
              <div
                key={point.title}
                className="rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-sm p-5 hover:bg-white/[0.09] hover:border-[#7dd3fc]/30 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[#7dd3fc] bg-[#2596be]/20 border border-[#2596be]/30 mb-3">
                  {point.icon}
                </div>
                <h3 className="text-sm font-bold text-white mb-1">{point.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{point.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom trust line */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs font-semibold text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="text-emerald-400">✓</span> HTTPS Secure
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-emerald-400">✓</span> Auto-delete files
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-emerald-400">✓</span> No data selling
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-emerald-400">✓</span> GDPR-friendly practices
          </span>
        </div>
      </div>
    </section>
  );
}
