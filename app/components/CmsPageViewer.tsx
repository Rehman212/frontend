'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { SiteShell } from './SiteShell';
import { type CmsPage } from '../admin/lib/cms-store';
import { fetchPublishedPageBySlug } from '../admin/lib/pages-api';

function LoadingState() {
  return (
    <SiteShell>
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#2596be' }} />
      </div>
    </SiteShell>
  );
}

export function CmsPageViewer({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const isPreview = searchParams.get('preview') === '1';
  const [page, setPage] = useState<CmsPage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    void (async () => {
      try {
        let found = await fetchPublishedPageBySlug(slug);
        if (!found && isPreview) {
          try {
            const raw = localStorage.getItem('auth');
            const token = raw ? (JSON.parse(raw) as { token?: string }).token : '';
            if (token) {
              const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'https://api.godoclab.com/api'}/admin/pages`,
                { headers: { Authorization: `Bearer ${token}` } },
              );
              if (res.ok) {
                const all = (await res.json()) as CmsPage[];
                found = all.find((p) => p.slug === slug) ?? null;
              }
            }
          } catch {
            found = null;
          }
        }
        if (cancelled) return;
        setPage(found);
        if (found) {
          document.title = found.seoTitle?.trim() || found.title;
          const meta = document.querySelector('meta[name="description"]');
          if (meta && found.seoDescription) {
            meta.setAttribute('content', found.seoDescription);
          }
        }
      } catch {
        if (!cancelled) setPage(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug, isPreview]);

  if (loading) return <LoadingState />;

  if (!page || (page.status !== 'published' && !isPreview)) {
    return (
      <SiteShell>
        <div className="flex flex-col items-center justify-center gap-4 px-4 py-32">
          <h1 className="text-2xl font-bold text-gray-800">Page not found</h1>
          <p className="text-gray-500 text-sm text-center max-w-sm">
            {page?.status === 'draft'
              ? 'This page is still a draft. Open it from admin with Preview.'
              : 'The page you are looking for does not exist.'}
          </p>
          <Link href="/" className="text-sm font-semibold text-sky-600 hover:underline">← Back to home</Link>
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <article className="max-w-4xl mx-auto px-4 py-10 sm:py-14">
        {isPreview && (
          <span className="inline-block mb-4 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
            Preview Mode
          </span>
        )}
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-8">{page.title}</h1>
        <div
          className="prose-page text-gray-700 text-[15px] leading-relaxed"
          dangerouslySetInnerHTML={{ __html: page.content || '<p>No content yet.</p>' }}
        />
      </article>
    </SiteShell>
  );
}

export function CmsPageViewerSuspense({ slug }: { slug: string }) {
  return (
    <Suspense fallback={<LoadingState />}>
      <CmsPageViewer slug={slug} />
    </Suspense>
  );
}
