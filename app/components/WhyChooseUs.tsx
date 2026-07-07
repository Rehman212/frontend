import { TOOLS, CATEGORIES } from '../lib/tools';

const REASONS = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-6 h-6">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    title: '100% Free Forever',
    description: 'Every tool is completely free — no trials, no paywalls, and no hidden charges on any feature.',
    color: '#2596be',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-6 h-6">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    title: 'Lightning Fast',
    description: 'Upload, process and download in seconds. Optimized servers deliver results without the wait.',
    color: '#1d4ed8',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-6 h-6">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    title: 'Secure & Private',
    description: 'Your files are handled with care. Secure processing and automatic deletion after use.',
    color: '#7c3aed',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-6 h-6">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="19" y1="8" x2="19" y2="14" />
        <line x1="22" y1="11" x2="16" y2="11" />
      </svg>
    ),
    title: 'No Sign-up Needed',
    description: 'Start using any tool instantly. No account, no email verification — just open and go.',
    color: '#0891b2',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-6 h-6">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
    title: 'Works in Your Browser',
    description: 'No software to install. Works on Windows, Mac, Linux, iOS and Android — anywhere online.',
    color: '#059669',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-6 h-6">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
    title: 'Professional Quality',
    description: 'Enterprise-grade PDF and image processing — merge, OCR, compress, convert and more in one hub.',
    color: '#db2777',
  },
];

export function WhyChooseUs() {
  const totalTools = TOOLS.length;
  const totalCategories = CATEGORIES.length;

  return (
    <section className="relative py-14 sm:py-20 overflow-hidden bg-[#f4f6f8]">
      {/* Subtle bg decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-[#2596be]/5 blur-3xl" />
      </div>

      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest text-[#2596be] bg-[#2596be]/10 border border-[#2596be]/20 mb-4">
            Why Choose Us
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4">
            The Smarter Way to Handle{' '}
            <span className="text-[#2596be]">PDFs &amp; Images</span>
          </h2>
          <p className="text-base text-slate-500 leading-relaxed">
            {totalTools}+ tools across {totalCategories} categories — built for speed, privacy and zero hassle.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {REASONS.map((item) => (
            <div
              key={item.title}
              className="group relative bg-white rounded-2xl border border-slate-200/80 p-6 hover:border-[#2596be]/30 hover:shadow-[0_12px_40px_rgba(37,150,190,0.1)] transition-all duration-300"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4 shadow-md transition-transform duration-300 group-hover:scale-110"
                style={{
                  background: `linear-gradient(135deg, ${item.color}, ${item.color}bb)`,
                  boxShadow: `0 6px 20px ${item.color}33`,
                }}
              >
                {item.icon}
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-[#2596be] transition-colors">
                {item.title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>

        {/* Bottom trust strip */}
        <div
          className="mt-10 rounded-2xl px-6 py-5 sm:px-8 sm:py-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #2596be 100%)' }}
        >
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-8 gap-y-3">
            {[
              { value: `${totalTools}+`, label: 'Free Tools' },
              { value: '100%', label: 'Free Forever' },
              { value: '0', label: 'Sign-up Required' },
            ].map((stat) => (
              <div key={stat.label} className="text-center sm:text-left">
                <p className="text-2xl font-black text-white">{stat.value}</p>
                <p className="text-xs font-semibold text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-300 text-center sm:text-right max-w-xs">
            Trusted by professionals worldwide for fast, reliable document processing.
          </p>
        </div>
      </div>
    </section>
  );
}
