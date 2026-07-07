import Link from 'next/link';

const STEPS = [
  {
    step: '01',
    title: 'Pick a Tool',
    description: 'Browse PDF or image categories and open the tool you need — merge, compress, convert and more.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-7 h-7">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
    ),
  },
  {
    step: '02',
    title: 'Upload Your File',
    description: 'Drag & drop or select files from your device. Most tools support PDF, Word, Excel, JPG, PNG and more.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-7 h-7">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
  },
  {
    step: '03',
    title: 'Process Instantly',
    description: 'Our servers handle the job in seconds. Adjust settings if needed — quality, format, pages and more.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-7 h-7">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
  },
  {
    step: '04',
    title: 'Download Result',
    description: 'Get your processed file immediately. No watermarks, no sign-up — just download and you\'re done.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-7 h-7">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
  },
];

export function HowOurToolsWork() {
  return (
    <section className="relative py-14 sm:py-20 bg-white border-y border-slate-200/80">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest text-[#2596be] bg-[#2596be]/10 border border-[#2596be]/20 mb-4">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4">
            How Our Tools{' '}
            <span className="text-[#2596be]">Work</span>
          </h2>
          <p className="text-base text-slate-500 leading-relaxed">
            Four simple steps — from upload to download. No account, no installation, no hassle.
          </p>
        </div>

        {/* Steps */}
        <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {/* Connector line — desktop only */}
          <div className="hidden lg:block absolute top-[3.25rem] left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-[#2596be]/20 via-[#2596be]/50 to-[#2596be]/20" />

          {STEPS.map((item, index) => (
            <div key={item.step} className="relative text-center lg:text-left">
              {/* Step number circle */}
              <div className="relative z-10 flex flex-col items-center lg:items-start mb-5">
                <div
                  className="w-[4.25rem] h-[4.25rem] rounded-2xl flex items-center justify-center text-white mx-auto lg:mx-0 shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, #2596be, #1d4ed8)',
                    boxShadow: '0 8px 24px rgba(37,150,190,0.35)',
                  }}
                >
                  {item.icon}
                </div>
                <span className="absolute -top-2 -right-2 lg:right-auto lg:-left-2 w-7 h-7 rounded-full bg-[#0f172a] text-white text-[11px] font-black flex items-center justify-center border-2 border-white shadow">
                  {index + 1}
                </span>
              </div>

              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#2596be] mb-1.5">
                Step {item.step}
              </p>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-14 text-center">
          <p className="text-sm text-slate-500 mb-4">Ready to try it? Pick any tool and start in seconds.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/#pdf-section"
              className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(135deg, #2596be, #1d4ed8)',
                boxShadow: '0 4px 20px rgba(37,150,190,0.4)',
              }}
            >
              Browse All Tools
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/tool/merge"
              className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl text-sm font-bold text-[#2596be] bg-[#2596be]/10 border border-[#2596be]/20 hover:bg-[#2596be]/15 transition-all"
            >
              Try Merge PDF
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
