import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteShell } from '../components/SiteShell';
import { ToolsCatalog } from '../components/ToolsCatalog';
import { TOOLS, CATEGORIES } from '../lib/tools';
import { getSiteUrl } from '../lib/site';

const site = getSiteUrl();
const pdfCount = TOOLS.filter((t) => !t.category.startsWith('img-')).length;
const imgCount = TOOLS.filter((t) => t.category.startsWith('img-')).length;
const categoryCount = CATEGORIES.filter((c) =>
  TOOLS.some((t) => t.category === c.id),
).length;

export const metadata: Metadata = {
  title: 'All PDF & Image Tools | GoDocLab',
  description:
    'Browse every free PDF and image tool — merge, split, compress, convert, edit, OCR and more. 100% free, no sign-up.',
  alternates: {
    canonical: `${site}/tools`,
  },
  openGraph: {
    title: 'All PDF & Image Tools | GoDocLab',
    description: 'Browse every free PDF and image tool — 100% free, no sign-up.',
    url: `${site}/tools`,
    type: 'website',
  },
};

export default function ToolsPage() {
  return (
    <SiteShell>
      <section
        className="relative overflow-hidden border-b border-slate-200/80"
        style={{
          background: 'linear-gradient(145deg, #0f172a 0%, #1e3a5f 45%, #2596be 120%)',
        }}
      >
        <div
          className="pointer-events-none absolute -top-24 -right-16 w-80 h-80 rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, #7dd3fc, transparent 70%)' }}
        />
        <div
          className="pointer-events-none absolute -bottom-20 left-10 w-64 h-64 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #38bdf8, transparent 70%)' }}
        />

        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <nav className="mb-5 flex flex-wrap items-center gap-1.5 text-[12px] text-slate-400">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-slate-200 font-medium">Tools</span>
          </nav>

          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[#7dd3fc] bg-white/10 border border-white/15 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {TOOLS.length} free tools
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-black text-white tracking-tight leading-[1.12]">
              All PDF &amp; image tools
            </h1>
            <p className="mt-3 sm:mt-4 text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              Merge, split, compress, convert, edit, OCR and more — everything runs in your browser.
              No signup, no watermarks, 100% free.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl">
            {[
              { label: 'Total tools', value: String(TOOLS.length) },
              { label: 'PDF tools', value: String(pdfCount) },
              { label: 'Image tools', value: String(imgCount) },
              { label: 'Categories', value: String(categoryCount) },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl bg-white/10 border border-white/15 px-4 py-3 backdrop-blur-sm"
              >
                <p className="text-xl sm:text-2xl font-black text-white tabular-nums">{stat.value}</p>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-300 mt-0.5">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <ToolsCatalog mode="full" showSectionHeader={false} />
      </div>
    </SiteShell>
  );
}
