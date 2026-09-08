'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { TOOLS, CATEGORIES, type Tool } from '../lib/tools';

type Category = (typeof CATEGORIES)[number];

/** Shorter labels for tab pills (reference-style). */
const TAB_LABELS: Record<string, string> = {
  organize: 'Organize PDF',
  'to-pdf': 'Convert to PDF',
  'from-pdf': 'Convert from PDF',
  edit: 'Edit PDF',
  security: 'PDF Security',
  forms: 'PDF Forms',
  standards: 'PDF Standards',
  'img-convert': 'Image Convert',
  'img-size': 'Image Size',
  'img-enhance': 'Image Enhance',
  'img-effects': 'Image Effects',
  'img-edit': 'Image Edit',
};

const POPULAR_SLUGS = new Set([
  'merge/pdf',
  'split-pdf',
  'compress',
  'ocr',
  'watermark',
  'pdf-to-image',
  'remove-background',
  'word-to-pdf',
  'jpg-to-png',
]);

const ALL_TAB = 'all';

function tabLabel(category: Category) {
  return TAB_LABELS[category.id] ?? category.label;
}

function ToolBadge({ tool }: { tool: Tool }) {
  if (POPULAR_SLUGS.has(tool.slug)) {
    return (
      <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-[#2596be]/10 text-[#2596be] border border-[#2596be]/20">
        Popular
      </span>
    );
  }

  if (tool.category.startsWith('img-')) {
    return (
      <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-emerald-50 text-emerald-600 border border-emerald-200">
        New
      </span>
    );
  }

  return null;
}

function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Link
      href={`/tool/${tool.slug}`}
      className="group flex flex-col bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 hover:border-[#2596be]/35 hover:shadow-[0_8px_30px_rgba(37,150,190,0.12)] hover:-translate-y-0.5 transition-all duration-200 h-full"
    >
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-sm"
          style={{
            background: `linear-gradient(135deg, ${tool.color}, ${tool.color}cc)`,
            boxShadow: `0 4px 14px ${tool.color}33`,
          }}
        >
          <span className="drop-shadow-sm">{tool.icon}</span>
        </div>

        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm sm:text-[15px] font-bold text-slate-900 leading-snug group-hover:text-[#2596be] transition-colors line-clamp-2">
              {tool.name}
            </h4>

            <div className="flex items-center gap-1 shrink-0">
              <ToolBadge tool={tool} />
              <span className="flex w-7 h-7 items-center justify-center rounded-lg bg-slate-100 text-slate-400 group-hover:bg-[#2596be] group-hover:text-white transition-all">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed line-clamp-2 mt-auto">
        {tool.description}
      </p>
    </Link>
  );
}

function resolveTabFromHash(hash: string): string {
  const id = hash.replace(/^#/, '');
  if (!id || id === 'pdf-section' || id === 'tools') return ALL_TAB;
  if (id === 'img-section') {
    const firstImg = CATEGORIES.find((c) => c.id.startsWith('img-'));
    return firstImg?.id ?? ALL_TAB;
  }
  if (CATEGORIES.some((c) => c.id === id)) return id;
  return ALL_TAB;
}

export function ToolsCatalog() {
  const [activeTab, setActiveTab] = useState(ALL_TAB);

  const categoriesWithTools = useMemo(
    () =>
      CATEGORIES.filter((category) =>
        TOOLS.some((t) => t.category === category.id),
      ),
    [],
  );

  const filteredTools = useMemo(() => {
    if (activeTab === ALL_TAB) return TOOLS;
    return TOOLS.filter((t) => t.category === activeTab);
  }, [activeTab]);

  const selectTab = useCallback((tabId: string) => {
    setActiveTab(tabId);
    if (typeof window === 'undefined') return;
    const nextHash = tabId === ALL_TAB ? 'pdf-section' : tabId;
    const url = `${window.location.pathname}${window.location.search}#${nextHash}`;
    window.history.replaceState(null, '', url);
  }, []);

  useEffect(() => {
    const syncFromHash = () => {
      setActiveTab(resolveTabFromHash(window.location.hash));
    };
    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  const activeCategory = categoriesWithTools.find((c) => c.id === activeTab);

  return (
    <div id="pdf-section" className="scroll-mt-24">
      {/* Header — reference style */}
      <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
          Every tool you need to work with PDFs &amp; images
        </h2>
        <p className="mt-3 sm:mt-4 text-sm sm:text-base text-slate-500 leading-relaxed">
          All tools are 100% free and easy to use. Merge, split, compress, convert, edit and more — right in your browser.
        </p>
      </div>

      {/* Tabs */}
      <div
        id="img-section"
        className="scroll-mt-24 mb-8 -mx-1 px-1 overflow-x-auto scrollbar-thin"
        role="tablist"
        aria-label="Tool categories"
      >
        <div className="flex flex-wrap justify-center gap-2 sm:gap-2.5 min-w-0 pb-1">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === ALL_TAB}
            onClick={() => selectTab(ALL_TAB)}
            className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === ALL_TAB
                ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            All
            <span
              className={`ml-1.5 text-[10px] font-bold ${
                activeTab === ALL_TAB ? 'text-white/70' : 'text-slate-400'
              }`}
            >
              {TOOLS.length}
            </span>
          </button>

          {categoriesWithTools.map((category) => {
            const count = TOOLS.filter((t) => t.category === category.id).length;
            const selected = activeTab === category.id;
            return (
              <button
                key={category.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => selectTab(category.id)}
                className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  selected
                    ? 'text-white shadow-md'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
                style={
                  selected
                    ? {
                        background: category.color,
                        boxShadow: `0 6px 16px ${category.color}40`,
                      }
                    : undefined
                }
              >
                <span className="mr-1.5 opacity-90">{category.icon}</span>
                {tabLabel(category)}
                <span
                  className={`ml-1.5 text-[10px] font-bold ${
                    selected ? 'text-white/80' : 'text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active category hint */}
      {activeTab !== ALL_TAB && activeCategory && (
        <div className="flex items-center justify-center gap-2 mb-6 text-sm text-slate-500">
          <span className="text-base">{activeCategory.icon}</span>
          <span>
            Showing{' '}
            <strong className="text-slate-800">{filteredTools.length}</strong> tools in{' '}
            <strong className="text-slate-800">{activeCategory.label}</strong>
          </span>
        </div>
      )}

      {/* Tool grid */}
      <div
        role="tabpanel"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5"
      >
        {filteredTools.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>

      {filteredTools.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <p className="text-sm font-semibold text-slate-700">No tools in this category</p>
          <button
            type="button"
            onClick={() => selectTab(ALL_TAB)}
            className="mt-3 text-sm font-bold text-[#2596be] hover:underline"
          >
            View all tools
          </button>
        </div>
      )}
    </div>
  );
}
