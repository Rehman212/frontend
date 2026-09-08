'use client';

import Link from 'next/link';
import Image from 'next/image';
import { CATEGORIES } from '../lib/tools';
import { useSiteBranding } from '../context/BrandingContext';

const pdfCategories = CATEGORIES.filter((c) => !c.id.startsWith('img-'));
const imageCategories = CATEGORIES.filter((c) => c.id.startsWith('img-'));

const POPULAR_TOOLS = [
  { label: 'Merge PDF', href: '/tool/merge/pdf' },
  { label: 'Compress PDF', href: '/tool/compress' },
  { label: 'PDF to Image', href: '/tool/pdf-to-image' },
  { label: 'Remove Background', href: '/tool/remove-background' },
  { label: 'OCR PDF', href: '/tool/ocr' },
];

const QUICK_LINKS = [
  { label: 'All PDF Tools', href: '/tool' },
  { label: 'All Image Tools', href: '/tool#img-section' },
  { label: 'Blog', href: '/blog' },
  { label: 'Sitemap', href: '/sitemap.xml' },
  { label: 'Login', href: '/login' },
  { label: 'Sign Up', href: '/signup' },
];

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  const className =
    'group inline-flex items-center gap-1.5 text-[13px] text-slate-400 hover:text-[#7dd3fc] transition-colors';
  const bullet = (
    <span className="w-1 h-1 rounded-full bg-slate-600 group-hover:bg-[#2596be] transition-colors shrink-0" />
  );

  if (href.endsWith('.xml')) {
    return (
      <a href={href} className={className}>
        {bullet}
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {bullet}
      {children}
    </Link>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <h4 className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-white mb-4 pb-2 border-b border-[#1e293b]">
        {title}
      </h4>
      <ul className="space-y-2.5">{children}</ul>
    </div>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();
  const { branding } = useSiteBranding();

  return (
    <footer
      className="mt-auto w-full shrink-0 relative z-10 border-t border-[#1e293b] pb-[env(safe-area-inset-bottom)]"
      style={{ background: 'linear-gradient(180deg, #0f172a 0%, #111827 100%)' }}
    >
      <div className="h-0.5 bg-gradient-to-r from-[#2596be] via-[#1e7ea1] to-[#2596be]/40" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-10 pb-8">
        <div className="flex flex-col xl:flex-row xl:items-start gap-10 xl:gap-14">
          {/* Brand */}
          <div className="xl:w-[340px] xl:shrink-0">
            <Link href="/" className="inline-block mb-5">
              <Image
                src={branding.footerLogo}
                alt="Digital Hub"
                width={280}
                height={84}
                className="h-16 sm:h-[4.5rem] w-auto object-contain brightness-0 invert opacity-90 hover:opacity-100 transition-opacity"
                unoptimized
              />
            </Link>
            <p className="text-[13px] text-slate-400 leading-relaxed mb-5">
              Every PDF and image tool you need — convert, merge, compress, edit and more.
              100% free, no sign-up required.
            </p>
            <div className="flex flex-wrap gap-2">
              {['Free Forever', 'No Sign-up', 'Instant Download'].map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold text-[#7dd3fc] bg-[#2596be]/15 border border-[#2596be]/25"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6 lg:gap-8 w-full">
            <FooterColumn title="PDF Tools">
              {pdfCategories.map((cat) => (
                <li key={cat.id}>
                  <FooterLink href={`/#${cat.id}`}>{cat.label}</FooterLink>
                </li>
              ))}
            </FooterColumn>

            <FooterColumn title="Image Tools">
              {imageCategories.map((cat) => (
                <li key={cat.id}>
                  <FooterLink href={`/#${cat.id}`}>{cat.label}</FooterLink>
                </li>
              ))}
            </FooterColumn>

            <FooterColumn title="Popular Tools">
              {POPULAR_TOOLS.map((link) => (
                <li key={link.href}>
                  <FooterLink href={link.href}>{link.label}</FooterLink>
                </li>
              ))}
            </FooterColumn>

            <FooterColumn title="Quick Links">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <FooterLink href={link.href}>{link.label}</FooterLink>
                </li>
              ))}
            </FooterColumn>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#1e293b] bg-[#0b1120]/60">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-slate-500">
            © {year} Digital Hub · No sign-up required
          </p>
          <p className="text-xs text-slate-500">
            Powered by{' '}
            <a
              href="https://aurexone.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#2596be] hover:text-[#7dd3fc] transition-colors"
            >
              aurexone.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
