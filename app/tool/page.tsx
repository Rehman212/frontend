import type { Metadata } from 'next';
import { SiteShell } from '../components/SiteShell';
import { ToolsCatalog } from '../components/ToolsCatalog';

export const metadata: Metadata = {
  title: 'All PDF & Image Tools | GoDocLab',
  description:
    'Browse every free PDF and image tool — merge, split, compress, convert, edit, OCR and more. 100% free, no sign-up.',
  alternates: {
    canonical: 'https://godoclab.com/tool',
  },
};

export default function AllToolsPage() {
  return (
    <SiteShell>
      <section
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 40%, #2596be 100%)',
          paddingTop: '2.5rem',
          paddingBottom: '2.5rem',
        }}
      >
        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-[#7dd3fc] mb-3">
            All tools
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Every PDF &amp; image tool
          </h1>
          <p className="mt-3 text-sm sm:text-base max-w-xl mx-auto leading-relaxed text-slate-300">
            Merge, split, compress, convert, edit and more — all free, right in your browser.
          </p>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <ToolsCatalog />
      </div>
    </SiteShell>
  );
}
