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
  'merge-pdf',
  'split-pdf',
  'compress-pdf',
  'ocr-pdf',
  'watermark-pdf',
  'pdf-to-image',
  'remove-background',
  'word-to-pdf',
  'jpg-to-png',
]);

const ALL_TAB = 'all';

export type ToolsCatalogMode = 'home' | 'full';

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
            <h3 className="text-sm sm:text-[15px] font-bold text-slate-900 leading-snug group-hover:text-[#2596be] transition-colors line-clamp-2">
              {tool.name}
            </h3>

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

function resolveTabFromHash(hash: string, allowAll: boolean, fallback: string): string {
  const id = hash.replace(/^#/, '');
  if (!id || id === 'pdf-section' || id === 'tools') {
    return allowAll ? ALL_TAB : fallback;
  }
  if (id === ALL_TAB) return allowAll ? ALL_TAB : fallback;
  if (id === 'img-section') {
    const firstImg = CATEGORIES.find((c) => c.id.startsWith('img-'));
    return firstImg?.id ?? fallback;
  }
  if (CATEGORIES.some((c) => c.id === id)) return id;
  return allowAll ? ALL_TAB : fallback;
}

export function ToolsCatalog({
  mode = 'home',
  showSectionHeader = true,
}: {
  mode?: ToolsCatalogMode;
  /** Home section title; hide on dedicated /tools page (has its own hero). */
  showSectionHeader?: boolean;
}) {
  const showAllTab = mode === 'full';
  const enableSearch = mode === 'full';

  const categoriesWithTools = useMemo(
    () =>
      CATEGORIES.filter((category) =>
        TOOLS.some((t) => t.category === category.id),
      ),
    [],
  );

  const defaultTab = showAllTab ? ALL_TAB : (categoriesWithTools[0]?.id ?? ALL_TAB);

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [query, setQuery] = useState('');

  const filteredTools = useMemo(() => {
    let list = activeTab === ALL_TAB ? TOOLS : TOOLS.filter((t) => t.category === activeTab);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.slug.toLowerCase().includes(q),
      );
    }
    return list;
  }, [activeTab, query]);

  const selectTab = useCallback(
    (tabId: string) => {
      setActiveTab(tabId);
      if (typeof window === 'undefined') return;
      const nextHash =
        tabId === ALL_TAB ? (showAllTab ? 'all' : 'pdf-section') : tabId;
      const url = `${window.location.pathname}${window.location.search}#${nextHash}`;
      window.history.replaceState(null, '', url);
    },
    [showAllTab],
  );

  useEffect(() => {
    const syncFromHash = () => {
      setActiveTab(resolveTabFromHash(window.location.hash, showAllTab, defaultTab));
    };
    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, [showAllTab, defaultTab]);

  const activeCategory = categoriesWithTools.find((c) => c.id === activeTab);

  return (
    <div id="pdf-section" className="scroll-mt-24">
      {showSectionHeader && (
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Every tool you need to work with PDFs &amp; images
          </h2>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-slate-500 leading-relaxed">
            All tools are 100% free and easy to use. Merge, split, compress, convert, edit and more —
            right in your browser.
          </p>
          {mode === 'home' && (
            <Link
              href="/tools"
              className="inline-flex mt-4 text-sm font-bold text-[#2596be] hover:underline"
            >
              Browse all {TOOLS.length} tools →
            </Link>
          )}
        </div>
      )}

      {enableSearch && (
        <div className="mb-6 max-w-xl mx-auto">
          <label className="relative block">
            <span className="sr-only">Search tools</span>
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tools — merge, compress, OCR…"
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#2596be] focus:ring-2 focus:ring-[#2596be]/20 shadow-sm"
            />
          </label>
        </div>
      )}

      {/* Tabs */}
      <div
        id="img-section"
        className="scroll-mt-24 mb-8 -mx-1 px-1 overflow-x-auto scrollbar-thin"
        role="tablist"
        aria-label="Tool categories"
      >
        <div className="flex flex-wrap justify-center gap-2 sm:gap-2.5 min-w-0 pb-1">
          {showAllTab && (
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
          )}

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

      {showAllTab && activeTab === ALL_TAB && !query.trim() && (
        <div className="flex items-center justify-center gap-2 mb-6 text-sm text-slate-500">
          <span>
            Showing all <strong className="text-slate-800">{TOOLS.length}</strong> free tools
          </span>
        </div>
      )}

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
          <p className="text-sm font-semibold text-slate-700">
            {query.trim() ? 'No tools match your search' : 'No tools in this category'}
          </p>
          {query.trim() ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="mt-3 text-sm font-bold text-[#2596be] hover:underline"
            >
              Clear search
            </button>
          ) : showAllTab ? (
            <button
              type="button"
              onClick={() => selectTab(ALL_TAB)}
              className="mt-3 text-sm font-bold text-[#2596be] hover:underline"
            >
              View all tools
            </button>
          ) : (
            <Link href="/tools" className="mt-3 inline-block text-sm font-bold text-[#2596be] hover:underline">
              Browse all tools →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
