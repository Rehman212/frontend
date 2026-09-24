'use client';

import Link from 'next/link';
import type { Tool } from '../../lib/tools';
import {
  categoryLabel,
  relatedToolsFor,
  type ToolPageData,
} from '../../lib/tool-page-html';

export type EditSection = 'hero' | 'body' | 'features' | 'faqs' | null;

type Props = {
  tool: Tool;
  data: ToolPageData;
  activeSection?: EditSection;
  onSelectSection?: (section: EditSection) => void;
  /** When true, sections are clickable for editing */
  editable?: boolean;
};

function SectionChrome({
  id,
  active,
  editable,
  label,
  onSelect,
  children,
  className = '',
}: {
  id: EditSection;
  active: boolean;
  editable?: boolean;
  label: string;
  onSelect?: (s: EditSection) => void;
  children: React.ReactNode;
  className?: string;
}) {
  if (!editable) {
    return <div className={className}>{children}</div>;
  }
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.(id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect?.(id);
        }
      }}
      className={`relative group cursor-pointer transition-shadow ${className} ${
        active ? 'ring-2 ring-[#2596be] ring-offset-2' : 'hover:ring-2 hover:ring-[#2596be]/50 hover:ring-offset-2'
      }`}
    >
      <span className="absolute top-3 right-3 z-10 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-[#2596be] text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Edit {label}
      </span>
      {children}
    </div>
  );
}

/** Full visual replica of the public tool page for admin editing / preview */
export function ToolFullPagePreview({
  tool,
  data,
  activeSection = null,
  onSelectSection,
  editable = false,
}: Props) {
  const accent = tool.color;
  const isImage = tool.category.startsWith('img-');
  const category = categoryLabel(tool);
  const related = relatedToolsFor(tool);
  const title = data.heroTitle || tool.name;
  const description = data.heroDescription || tool.description;

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm text-left">
      {/* Fake site chrome */}
      <div className="bg-slate-900 text-white text-[10px] px-4 py-1.5 text-center tracking-wide">
        100% free tools — no signup · preview of /tool/{tool.slug}
      </div>
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white">
        <span className="font-black text-slate-900 text-sm tracking-tight">GoDocLab</span>
        <span className="text-[11px] text-slate-400">Home · Tools · Blog</span>
      </div>

      {/* Hero */}
      <SectionChrome
        id="hero"
        label="hero"
        active={activeSection === 'hero'}
        editable={editable}
        onSelect={onSelectSection}
        className="bg-slate-950 text-white"
      >
        <div
          className="px-5 sm:px-8 py-8 sm:py-10 relative overflow-hidden"
          style={{
            background: `radial-gradient(ellipse 70% 50% at 15% 0%, ${accent}44, transparent 55%)`,
          }}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] mb-3" style={{ color: accent }}>
            {isImage ? 'Image tool' : 'PDF tool'} · Free online
          </p>
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">{title}</h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-5 max-w-md">
                {description}
              </p>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>▸ No signup required to download</li>
                <li>▸ Files removed after processing</li>
                <li>▸ Works on phone &amp; desktop</li>
              </ul>
            </div>
            <div
              className="rounded-xl border border-white/10 p-6 text-center pointer-events-none"
              style={{ background: 'rgba(15,23,42,0.85)' }}
            >
              <div
                className="w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center text-xl"
                style={{ background: `${accent}33`, color: accent }}
              >
                {tool.icon || '↑'}
              </div>
              <p className="text-sm font-bold text-white mb-1">{tool.inputLabel}</p>
              <p className="text-xs text-slate-400 mb-3">Drag &amp; drop or click to browse</p>
              <span
                className="inline-block text-[10px] font-semibold px-2 py-1 rounded"
                style={{ background: `${accent}22`, color: accent }}
              >
                Supported: {tool.acceptedFormats.replace(/\./g, '').toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </SectionChrome>

      {/* Body content */}
      <SectionChrome
        id="body"
        label="page content"
        active={activeSection === 'body'}
        editable={editable}
        onSelect={onSelectSection}
        className="bg-white border-t border-slate-100"
      >
        <div className="px-5 sm:px-8 py-10 grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 min-w-0">
            <div
              className="prose-page max-w-none text-slate-700 text-sm"
              dangerouslySetInnerHTML={{ __html: data.content || '<p><em>No content yet.</em></p>' }}
            />
          </div>
          <aside className="lg:col-span-5 text-sm">
            <dl className="space-y-3 lg:border-l lg:border-slate-200 lg:pl-6">
              {[
                ['Category', category],
                ['Accepts', tool.acceptedFormats.replace(/\./g, '').toUpperCase()],
                ['Output', tool.outputFormat],
                ['Cost', 'Free'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3 border-b border-slate-100 pb-2">
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{k}</dt>
                  <dd className="font-semibold text-slate-900 text-right text-xs">{v}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      </SectionChrome>

      {/* Features */}
      <SectionChrome
        id="features"
        label="features"
        active={activeSection === 'features'}
        editable={editable}
        onSelect={onSelectSection}
        className="bg-slate-950 text-white"
      >
        <div className="px-5 sm:px-8 py-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] mb-2" style={{ color: accent }}>
            Why GoDocLab
          </p>
          <h2 className="text-2xl font-black mb-8">Everything you need around {title}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(data.features || []).map((f, i) => (
              <div key={`${f.title}-${i}`} className="pt-4 border-t border-white/15">
                <span className="text-[10px] font-mono text-white/30">0{i + 1}</span>
                <h3 className="font-bold mt-1 mb-1.5 text-sm">{f.title || 'Feature'}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{f.body}</p>
              </div>
            ))}
            {!data.features?.length && (
              <p className="text-sm text-slate-500 col-span-full">No features yet — click to add.</p>
            )}
          </div>
        </div>
      </SectionChrome>

      {/* FAQ */}
      <SectionChrome
        id="faqs"
        label="FAQ"
        active={activeSection === 'faqs'}
        editable={editable}
        onSelect={onSelectSection}
        className="bg-slate-50 border-y border-slate-200"
      >
        <div className="px-5 sm:px-8 py-10 grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 mb-2">FAQ</p>
            <h2 className="text-2xl font-black text-slate-900">Questions about {title}</h2>
          </div>
          <div className="lg:col-span-8 divide-y divide-slate-200">
            {(data.faqs || []).map((faq, i) => (
              <div key={`${faq.question}-${i}`} className="py-4">
                <p className="font-bold text-slate-900 text-sm mb-1">{faq.question}</p>
                <p className="text-xs text-slate-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
            {!data.faqs?.length && (
              <p className="text-sm text-slate-500 py-4">No FAQs yet — click to add.</p>
            )}
          </div>
        </div>
      </SectionChrome>

      {/* Related — not editable (auto from catalog) */}
      {related.length > 0 && (
        <div className="px-5 sm:px-8 py-10 bg-white">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 mb-2">
            Keep going · auto from catalog
          </p>
          <h2 className="text-xl font-black text-slate-900 mb-5">More in {category}</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200 border border-slate-200">
            {related.slice(0, 4).map((t) => (
              <div key={t.slug} className="bg-white p-4">
                <span className="text-lg">{t.icon}</span>
                <p className="font-bold text-slate-900 text-sm mt-1">{t.name}</p>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 mt-3">
            Related tools update automatically — not edited here.
          </p>
        </div>
      )}

      <div className="py-4 text-center border-t border-slate-100">
        <Link href={`/tool/${tool.slug}`} target="_blank" className="text-xs font-semibold text-[#2596be]">
          Open live page ↗
        </Link>
      </div>
    </div>
  );
}
