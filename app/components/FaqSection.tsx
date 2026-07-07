'use client';

import { useState } from 'react';

const FAQS = [
  {
    question: 'Are all tools really free?',
    answer:
      'Yes. Every PDF and image tool on Digital Hub is 100% free with no hidden fees, subscriptions, or premium tiers. You can use any tool as many times as you need.',
  },
  {
    question: 'Do I need to create an account?',
    answer:
      'No account is required for most tools. Simply open a tool, upload your file, and download the result. Signing up is optional if you want to save files to your dashboard.',
  },
  {
    question: 'Is my data safe and private?',
    answer:
      'Your files are processed securely over encrypted connections. Uploaded files are automatically deleted from our servers after processing — we do not store or share your documents.',
  },
  {
    question: 'What file formats are supported?',
    answer:
      'We support PDF, Word, Excel, PowerPoint, JPG, PNG, WebP, HTML, EPUB and many more depending on the tool. Each tool page shows its accepted formats before you upload.',
  },
  {
    question: 'Is there a file size limit?',
    answer:
      'Most tools support large files, though limits may vary by tool and server capacity. If a file is too large, try compressing it first or splitting it into smaller parts.',
  },
  {
    question: 'Does it work on mobile phones?',
    answer:
      'Yes. All tools run in your browser and work on phones, tablets, and desktops — no app installation needed on any device.',
  },
  {
    question: 'Will there be watermarks on my files?',
    answer:
      'No. Processed files are delivered without watermarks. What you download is your clean, finished file.',
  },
  {
    question: 'Can I use these tools for commercial work?',
    answer:
      'Yes. You may use our tools for personal and commercial projects. Please ensure you have the right to process any files you upload.',
  },
];

function FaqItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`rounded-2xl border transition-all duration-200 ${
        isOpen
          ? 'border-[#2596be]/40 bg-white shadow-[0_8px_30px_rgba(37,150,190,0.08)]'
          : 'border-slate-200/80 bg-white hover:border-slate-300'
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 sm:px-6 sm:py-5 text-left"
        aria-expanded={isOpen}
      >
        <span className={`text-sm sm:text-base font-bold transition-colors ${isOpen ? 'text-[#2596be]' : 'text-slate-900'}`}>
          {question}
        </span>
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${
            isOpen ? 'bg-[#2596be] text-white rotate-180' : 'bg-slate-100 text-slate-500'
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </button>

      <div
        className={`grid transition-all duration-200 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-5 sm:px-6 sm:pb-6 text-sm text-slate-500 leading-relaxed border-t border-slate-100 pt-4">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="relative py-14 sm:py-20 bg-white border-t border-slate-200/80">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-10 lg:gap-16 items-start">
          {/* Left — sticky intro */}
          <div className="lg:sticky lg:top-24">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest text-[#2596be] bg-[#2596be]/10 border border-[#2596be]/20 mb-4">
              FAQs
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4">
              Frequently Asked{' '}
              <span className="text-[#2596be]">Questions</span>
            </h2>
            <p className="text-base text-slate-500 leading-relaxed mb-6">
              Got questions? Here are answers to the most common ones about our free PDF and image tools.
            </p>
            <div className="rounded-2xl border border-slate-200 bg-[#f4f6f8] p-5">
              <p className="text-sm font-bold text-slate-800 mb-1">Still need help?</p>
              <p className="text-sm text-slate-500">
                Visit any tool page and start processing — most issues are resolved by using the right file format.
              </p>
            </div>
          </div>

          {/* Right — accordion */}
          <div className="space-y-3">
            {FAQS.map((faq, index) => (
              <FaqItem
                key={faq.question}
                question={faq.question}
                answer={faq.answer}
                isOpen={openIndex === index}
                onToggle={() => setOpenIndex(openIndex === index ? null : index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
