'use client';

import { useState } from 'react';

export function BlogFaqList({ faqs }: { faqs: { question: string; answer: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!faqs.length) return null;

  return (
    <section className="mt-12 pt-10 border-t border-slate-200">
      <p className="text-xs font-semibold uppercase tracking-widest text-[#2596be] mb-2">FAQs</p>
      <h2 className="text-2xl font-black text-gray-900 mb-6">Frequently asked questions</h2>
      <div className="space-y-3">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={`${index}-${faq.question}`}
              className={`rounded-2xl border transition-all duration-200 ${
                isOpen
                  ? 'border-[#2596be]/40 bg-white shadow-[0_8px_30px_rgba(37,150,190,0.08)]'
                  : 'border-slate-200/80 bg-white'
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                aria-expanded={isOpen}
              >
                <span className={`text-sm sm:text-base font-bold ${isOpen ? 'text-[#2596be]' : 'text-slate-900'}`}>
                  {faq.question}
                </span>
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                    isOpen ? 'bg-[#2596be] text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </span>
              </button>
              {isOpen && (
                <p className="px-5 pb-5 text-sm text-slate-500 leading-relaxed border-t border-slate-100 pt-4">
                  {faq.answer}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
