import Link from 'next/link';
import { TOOLS, CATEGORIES, type Tool } from '../lib/tools';

type Category = (typeof CATEGORIES)[number];

const POPULAR_SLUGS = new Set([
  'merge',
  'split',
  'compress',
  'ocr',
  'watermark',
  'pdf-to-image',
  'remove-background',
  'word-to-pdf',
  'jpg-to-png',
]);

function SectionBanner({
  id,
  icon,
  title,
  subtitle,
  toolCount,
  categoryCount,
  from,
  to,
}: {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  toolCount: number;
  categoryCount: number;
  from: string;
  to: string;
}) {
  return (
    <div
      id={id}
      className="scroll-mt-24 mb-8 rounded-2xl overflow-hidden shadow-lg shadow-slate-900/10"
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      <div className="px-6 py-6 sm:px-8 sm:py-7 flex flex-col sm:flex-row sm:items-center gap-5">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl shrink-0">
            {icon}
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">{title}</h2>
            <p className="text-sm text-white/75 mt-1">{subtitle}</p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <span className="px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-bold text-white">
            {toolCount} tools
          </span>
          <span className="px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-bold text-white">
            {categoryCount} categories
          </span>
        </div>
      </div>
    </div>
  );
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
      className="group flex flex-col bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-[1.125rem] hover:border-[#2596be]/35 hover:shadow-[0_8px_30px_rgba(37,150,190,0.12)] transition-all duration-200 h-full"
    >
      {/* Top row: icon + title + badges + actions */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-sm"
          style={{
            background: `linear-gradient(135deg, ${tool.color}, ${tool.color}cc)`,
            boxShadow: `0 4px 14px ${tool.color}33`,
          }}
        >
          <span className="drop-shadow-sm">{tool.icon}</span>
        </div>

        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-[#2596be] transition-colors line-clamp-2">
              {tool.name}
            </h4>

            <div className="flex items-center gap-1 shrink-0">
              <ToolBadge tool={tool} />

              <span
                className="hidden sm:flex w-7 h-7 items-center justify-center rounded-lg text-slate-300 group-hover:text-rose-400 transition-colors"
                aria-hidden
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </span>

              <span className="flex w-7 h-7 items-center justify-center rounded-lg bg-slate-100 text-slate-400 group-hover:bg-[#2596be] group-hover:text-white transition-all">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed line-clamp-2 mt-auto">
        {tool.description}
      </p>
    </Link>
  );
}

function CategoryBlock({ category, tools }: { category: Category; tools: Tool[] }) {
  return (
    <section id={category.id} className="scroll-mt-24 mb-10">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-1 h-8 rounded-full shrink-0" style={{ background: category.color }} />
        <span className="text-lg">{category.icon}</span>
        <h3 className="text-base sm:text-lg font-bold text-slate-900">{category.label}</h3>
        <span
          className="text-xs font-bold px-2.5 py-0.5 rounded-full"
          style={{ background: `${category.color}14`, color: category.color }}
        >
          {tools.length} tools
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tools.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>
    </section>
  );
}

export function ToolsCatalog() {
  const pdfCategories = CATEGORIES.filter((c) => !c.id.startsWith('img-'));
  const imageCategories = CATEGORIES.filter((c) => c.id.startsWith('img-'));
  const pdfToolCount = TOOLS.filter((t) => !t.category.startsWith('img-')).length;
  const imageToolCount = TOOLS.filter((t) => t.category.startsWith('img-')).length;

  return (
    <div>
      <SectionBanner
        id="pdf-section"
        icon="📄"
        title="PDF Document Tools"
        subtitle="Convert, merge, split, protect, OCR and edit PDFs in your browser."
        toolCount={pdfToolCount}
        categoryCount={pdfCategories.length}
        from="#1e40af"
        to="#2596be"
      />

      {pdfCategories.map((category) => {
        const tools = TOOLS.filter((t) => t.category === category.id);
        if (!tools.length) return null;
        return <CategoryBlock key={category.id} category={category} tools={tools} />;
      })}

      <SectionBanner
        id="img-section"
        icon="🖼️"
        title="Digital Image Hub"
        subtitle="Resize, convert, enhance and edit images online."
        toolCount={imageToolCount}
        categoryCount={imageCategories.length}
        from="#6d28d9"
        to="#db2777"
      />

      {imageCategories.map((category) => {
        const tools = TOOLS.filter((t) => t.category === category.id);
        if (!tools.length) return null;
        return <CategoryBlock key={category.id} category={category} tools={tools} />;
      })}
    </div>
  );
}
