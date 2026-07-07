'use client';

const REVIEWS = [
  {
    name: 'Sarah Mitchell',
    role: 'Marketing Manager · BrightEdge Agency',
    text: 'We merge dozens of client PDFs every week. This is the fastest, cleanest tool we have found — no sign-up, no watermarks, just results.',
    initials: 'SM',
    color: '#2596be',
  },
  {
    name: 'James Okonkwo',
    role: 'Freelance Designer · Lagos',
    text: 'The image conversion and background removal tools saved me hours on a recent project. Quality is genuinely professional every time.',
    initials: 'JO',
    color: '#1d4ed8',
  },
  {
    name: 'Ayesha Rahman',
    role: 'Office Administrator · Tech Solutions',
    text: 'Our whole team uses the compress and split tools daily. Files are processed in seconds and the interface is incredibly simple.',
    initials: 'AR',
    color: '#7c3aed',
  },
  {
    name: 'David Laurent',
    role: 'Small Business Owner · Montréal',
    text: 'I needed to convert invoices to PDF and add watermarks — all done in one place without installing anything. Absolutely free.',
    initials: 'DL',
    color: '#0891b2',
  },
  {
    name: 'Priya Sharma',
    role: 'University Student · Mumbai',
    text: 'Perfect for coursework — merge lecture PDFs, convert images, and download instantly. Works flawlessly on my phone too.',
    initials: 'PS',
    color: '#db2777',
  },
  {
    name: 'Marcus Turner',
    role: 'Legal Assistant · Turner & Co.',
    text: 'OCR and PDF extraction tools are reliable for our document workflow. Secure processing gives us confidence with sensitive files.',
    initials: 'MT',
    color: '#059669',
  },
  {
    name: 'Lena Weiss',
    role: 'HR Manager · NovaStaff GmbH',
    text: 'We process hundreds of forms and contracts monthly. The tools are fast, free, and our team needs zero training to use them.',
    initials: 'LW',
    color: '#ea580c',
  },
  {
    name: 'Sofia García',
    role: 'Content Creator · Madrid',
    text: 'Resize, convert and enhance images in bulk before publishing. The visual effects tools are a hidden gem — love this platform.',
    initials: 'SG',
    color: '#4f46e5',
  },
];

function Stars() {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#2596be">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function QuoteIcon() {
  return (
    <svg
      className="absolute top-5 right-5 w-8 h-8 text-slate-200"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.016 3.016 0 0 1-2.2 2.905c-1.002.382-2.041.396-3.051.029zm10.001 0c-1.03-1.094-1.583-2.321-1.583-4.31 0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.016 3.016 0 0 1-2.2 2.905c-1.002.382-2.041.396-3.051.029z" />
    </svg>
  );
}

function ReviewCard({ review }: { review: (typeof REVIEWS)[number] }) {
  return (
    <div className="relative shrink-0 w-[320px] sm:w-[360px] bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md hover:border-[#2596be]/20 transition-all duration-300">
      <QuoteIcon />

      <div className="flex items-center gap-3 mb-4 pr-8">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
          style={{ background: `linear-gradient(135deg, ${review.color}, ${review.color}aa)` }}
        >
          {review.initials}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-900 truncate">{review.name}</p>
          <p className="text-xs text-slate-500 truncate">{review.role}</p>
        </div>
      </div>

      <p className="text-sm text-slate-600 leading-relaxed mb-5 line-clamp-4">{review.text}</p>

      <Stars />
    </div>
  );
}

function MarqueeRow({ reviews, reverse }: { reviews: typeof REVIEWS; reverse?: boolean }) {
  const items = [...reviews, ...reviews];

  return (
    <div className="reviews-marquee-mask overflow-hidden">
      <div className={`reviews-marquee-track flex gap-4 w-max ${reverse ? 'reviews-marquee-reverse' : 'reviews-marquee-forward'}`}>
        {items.map((review, i) => (
          <ReviewCard key={`${review.name}-${i}`} review={review} />
        ))}
      </div>
    </div>
  );
}

export function ReviewsSection() {
  const row1 = REVIEWS.slice(0, 4);
  const row2 = REVIEWS.slice(4, 8);

  return (
    <section className="relative py-14 sm:py-20 bg-[#f4f6f8] overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 mb-10">
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest text-[#2596be] bg-[#2596be]/10 border border-[#2596be]/20 mb-4">
            Reviews
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4">
            Loved by{' '}
            <span className="text-[#2596be]">Thousands</span>
          </h2>
          <p className="text-base text-slate-500 leading-relaxed">
            See what professionals, students and teams say about our free PDF and image tools.
          </p>

          {/* Overall rating */}
          <div className="inline-flex items-center gap-3 mt-6 px-5 py-2.5 rounded-full bg-white border border-slate-200 shadow-sm">
            <Stars />
            <span className="text-sm font-bold text-slate-900">4.9 / 5</span>
            <span className="text-xs text-slate-400">· 2,000+ reviews</span>
          </div>
        </div>
      </div>

      {/* Marquee rows */}
      <div className="space-y-4">
        <MarqueeRow reviews={row1} />
        <MarqueeRow reviews={row2} reverse />
      </div>
    </section>
  );
}
