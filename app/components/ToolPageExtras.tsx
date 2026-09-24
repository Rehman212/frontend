'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Tool } from '../lib/tools';
import {
  categoryLabel,
  defaultToolPageData,
  mergeToolPageData,
  relatedToolsFor,
  type ToolPageData,
} from '../lib/tool-page-html';
import { fetchToolPageContent } from '../admin/lib/tool-pages-api';

export function ToolPageExtras({ tool }: { tool: Tool }) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [page, setPage] = useState<ToolPageData>(() => defaultToolPageData(tool));
  const accent = tool.color;
  const category = categoryLabel(tool);
  const related = relatedToolsFor(tool);

  useEffect(() => {
    let cancelled = false;
    setPage(defaultToolPageData(tool));
    fetchToolPageContent(tool.slug)
      .then((saved) => {
        if (!cancelled) setPage(mergeToolPageData(tool, saved));
      })
      .catch(() => {
        if (!cancelled) setPage(defaultToolPageData(tool));
      });
    return () => {
      cancelled = true;
    };
  }, [tool]);

  return (
    <>
      <section className="border-t border-slate-200 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-16 lg:py-20 grid lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-7 min-w-0">
            <div
              className="prose-page max-w-none text-slate-700"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          </div>
          <aside className="lg:col-span-5">
            <div className="h-full min-h-[220px] flex flex-col justify-between border-l-0 lg:border-l border-slate-200 lg:pl-10">
              <dl className="space-y-5">
                {[
                  ['Category', category],
                  ['Accepts', tool.acceptedFormats.replace(/\./g, '').toUpperCase()],
                  ['Output', tool.outputFormat],
                  ['Cost', 'Free'],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="flex items-baseline justify-between gap-4 border-b border-slate-100 pb-4"
                  >
                    <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">{k}</dt>
                    <dd className="text-sm font-semibold text-slate-900 text-right">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </aside>
        </div>
      </section>

      <section className="bg-slate-950 text-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-16 lg:py-20">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: accent }}>
            Why GoDocLab
          </p>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-10 max-w-xl">
            Everything you need around {page.heroTitle || tool.name}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {page.features.map((f, i) => (
              <div key={`${f.title}-${i}`} className="relative pt-6 border-t border-white/15">
                <span className="absolute top-0 right-0 text-xs font-mono text-white/30">
                  0{i + 1}
                </span>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f8fafc] border-y border-slate-200">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-16 lg:py-20 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">FAQ</p>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight sticky top-24">
              Questions about {page.heroTitle || tool.name}
            </h2>
          </div>
          <div className="lg:col-span-8 divide-y divide-slate-200">
            {page.faqs.map((item, i) => {
              const open = openFaq === i;
              return (
                <button
                  key={`${item.question}-${i}`}
                  type="button"
                  onClick={() => setOpenFaq(open ? null : i)}
                  className="w-full text-left py-5 group"
                >
                  <div className="flex items-start justify-between gap-6">
                    <span className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#2596be] transition-colors">
                      {item.question}
                    </span>
                    <span
                      className="shrink-0 text-xl font-light leading-none mt-0.5"
                      style={{ color: open ? accent : '#94a3b8' }}
                    >
                      {open ? '−' : '+'}
                    </span>
                  </div>
                  {open && (
                    <p className="mt-3 text-slate-600 text-[15px] leading-relaxed max-w-2xl">
                      {item.answer}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="bg-white">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-16 lg:py-20">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3">
                  Keep going
                </p>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                  More in {category}
                </h2>
              </div>
              <Link
                href="/tool"
                className="text-sm font-bold underline underline-offset-4 decoration-slate-300 hover:decoration-[#2596be] hover:text-[#2596be]"
              >
                All tools
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200 border border-slate-200">
              {related.map((t) => (
                <Link
                  key={t.slug}
                  href={`/tool/${t.slug}`}
                  className="bg-white p-5 sm:p-6 hover:bg-slate-50 transition-colors group"
                >
                  <span className="text-2xl mb-3 block">{t.icon}</span>
                  <p className="font-bold text-slate-900 group-hover:text-[#2596be] transition-colors">
                    {t.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                    {t.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
