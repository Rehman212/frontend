'use client';

import Link from 'next/link';
import { TOOLS, CATEGORIES, type Tool } from '../lib/tools';

const POPULAR_SLUGS = [
  'merge',
  'compress',
  'ocr',
  'remove-background',
  'pdf-to-image',
  'split',
  'word-to-pdf',
  'watermark',
  'jpg-to-png',
  'pdf-to-word',
];

function getCategoryLabel(categoryId: string) {
  return CATEGORIES.find((c) => c.id === categoryId)?.label ?? 'Tool';
}

function getPopularTools(): Tool[] {
  return POPULAR_SLUGS.map((slug) => TOOLS.find((t) => t.slug === slug)).filter(Boolean) as Tool[];
}

function ToolSlideCard({ tool }: { tool: Tool }) {
  return (
    <Link
      href={`/tool/${tool.slug}`}
      className="group relative flex items-center gap-3 shrink-0 w-[240px] sm:w-[255px] h-[72px] bg-white rounded-xl border border-slate-200/90 px-3.5 py-3 shadow-sm hover:shadow-md hover:border-[#2596be]/30 hover:-translate-y-0.5 transition-all duration-300"
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0 transition-transform duration-300 group-hover:scale-105"
        style={{
          background: tool.bgColor,
          border: `1px solid ${tool.borderColor}`,
        }}
      >
        {tool.icon}
      </div>

      <div className="flex-1 min-w-0 pr-6">
        <p className="text-sm font-bold text-slate-900 truncate group-hover:text-[#2596be] transition-colors leading-tight">
          {tool.name}
        </p>
        <p className="text-[11px] text-slate-500 truncate mt-0.5">{getCategoryLabel(tool.category)}</p>
      </div>

      <svg
        className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-hover:text-[#2596be] group-hover:translate-x-0.5 transition-all shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      >
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </Link>
  );
}

function MarqueeRow({ tools, reverse }: { tools: Tool[]; reverse?: boolean }) {
  const items = [...tools, ...tools];

  return (
    <div className="reviews-marquee-mask overflow-hidden">
      <div
        className={`reviews-marquee-track flex items-center gap-3 w-max ${reverse ? 'reviews-marquee-reverse' : 'reviews-marquee-forward'}`}
      >
        {items.map((tool, i) => (
          <ToolSlideCard key={`${tool.slug}-${i}`} tool={tool} />
        ))}
      </div>
    </div>
  );
}

export function PopularToolsSection() {
  const tools = getPopularTools();
  const row1 = tools.slice(0, 5);
  const row2 = tools.slice(5);

  return (
    <section className="relative py-14 sm:py-20 bg-white border-y border-slate-200/80 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 mb-10">
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest text-[#2596be] bg-[#2596be]/10 border border-[#2596be]/20 mb-4">
            Popular Tools
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4">
            Most Used{' '}
            <span className="text-[#2596be]">Tools</span>
          </h2>
          <p className="text-base text-slate-500 leading-relaxed">
            Jump straight to our top PDF and image tools — hover to pause, click to open instantly.
          </p>

          <div className="inline-flex items-center gap-3 mt-6 px-5 py-2.5 rounded-full bg-[#f4f6f8] border border-slate-200">
            <span className="text-lg leading-none">⚡</span>
            <span className="text-sm font-bold text-slate-900">{tools.length} trending tools</span>
            <span className="text-xs text-slate-400">· Free · No sign-up</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <MarqueeRow tools={row1} />
        {row2.length > 0 && <MarqueeRow tools={row2} reverse />}
      </div>
    </section>
  );
}
