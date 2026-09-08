'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { SiteShell } from '../components/SiteShell';
import {
  fetchPublishedPosts,
  fetchSiteSettings,
  type BlogPost,
} from '../admin/lib/posts-api';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function pageWindow(current: number, total: number) {
  const pages: number[] = [];
  const start = Math.max(1, current - 2);
  const end = Math.min(total, current + 2);
  for (let p = start; p <= end; p++) pages.push(p);
  return pages;
}

function Pagination({
  page,
  totalPages,
  onPage,
}: {
  page: number;
  totalPages: number;
  onPage: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  const pages = pageWindow(page, totalPages);

  return (
    <nav
      className="mt-10 flex flex-wrap items-center justify-center gap-2"
      aria-label="Blog pagination"
    >
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        className="min-h-10 px-3.5 rounded-lg text-sm font-semibold border border-gray-200 bg-white text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#2596be] hover:text-[#2596be]"
      >
        Previous
      </button>
      {pages[0] > 1 && (
        <>
          <button
            type="button"
            onClick={() => onPage(1)}
            className="min-h-10 min-w-10 px-3 rounded-lg text-sm font-semibold border border-gray-200 bg-white text-gray-700"
          >
            1
          </button>
          {pages[0] > 2 && <span className="px-1 text-gray-400">…</span>}
        </>
      )}
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPage(p)}
          className={`min-h-10 min-w-10 px-3 rounded-lg text-sm font-semibold ${
            p === page
              ? 'text-white'
              : 'border border-gray-200 bg-white text-gray-700 hover:border-[#2596be] hover:text-[#2596be]'
          }`}
          style={p === page ? { background: '#2596be' } : undefined}
          aria-current={p === page ? 'page' : undefined}
        >
          {p}
        </button>
      ))}
      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && <span className="px-1 text-gray-400">…</span>}
          <button
            type="button"
            onClick={() => onPage(totalPages)}
            className="min-h-10 min-w-10 px-3 rounded-lg text-sm font-semibold border border-gray-200 bg-white text-gray-700"
          >
            {totalPages}
          </button>
        </>
      )}
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPage(page + 1)}
        className="min-h-10 px-3.5 rounded-lg text-sm font-semibold border border-gray-200 bg-white text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#2596be] hover:text-[#2596be]"
      >
        Next
      </button>
    </nav>
  );
}

function BlogCard({ post }: { post: BlogPost }) {
  return (
    <article className="group flex flex-col h-full bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <Link href={`/blog/${post.slug}`} className="flex flex-col h-full">
        <div
          className="relative h-36 flex items-center justify-center overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #112240 0%, #1e3a5f 50%, #2596be 100%)' }}
        >
          {post.featuredImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.featuredImage}
              alt={post.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <>
              <div
                className="absolute inset-0 opacity-20"
                style={{ background: 'radial-gradient(circle at 80% 20%, #7dd3fc, transparent 55%)' }}
              />
              <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center text-2xl bg-white/15 backdrop-blur-sm border border-white/20">
                📝
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col flex-1 p-5">
          <time
            dateTime={post.createdAt}
            className="text-[11px] font-semibold uppercase tracking-wider text-[#2596be]"
          >
            {formatDate(post.createdAt)}
          </time>
          <h2 className="mt-2 text-base font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-[#2596be] transition-colors">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="mt-2 text-sm text-gray-500 leading-relaxed line-clamp-3 flex-1">
              {post.excerpt}
            </p>
          )}
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
            <span className="text-xs text-gray-400 truncate">By {post.author}</span>
            <span className="text-xs font-bold text-[#2596be] group-hover:underline shrink-0">
              Read more →
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

function BlogCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-pulse">
      <div className="h-36 bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="h-3 w-20 bg-gray-200 rounded" />
        <div className="h-4 w-full bg-gray-200 rounded" />
        <div className="h-4 w-4/5 bg-gray-200 rounded" />
        <div className="h-3 w-full bg-gray-100 rounded mt-4" />
      </div>
    </div>
  );
}

export default function BlogListingPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-sm text-gray-500">Loading blog…</div>}>
      <BlogListing />
    </Suspense>
  );
}

function BlogListing() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageParam = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [perPage, setPerPage] = useState(9);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([fetchPublishedPosts(), fetchSiteSettings()])
      .then(([list, settings]) => {
        setPosts(list);
        setPerPage(settings.blogPostsPerPage);
      })
      .catch(() => setError('Could not load blog posts.'))
      .finally(() => setLoading(false));
  }, []);

  const totalPages = Math.max(1, Math.ceil(posts.length / perPage));
  const page = Math.min(pageParam, totalPages);
  const pagePosts = useMemo(() => {
    const start = (page - 1) * perPage;
    return posts.slice(start, start + perPage);
  }, [posts, page, perPage]);

  const goToPage = (next: number) => {
    const safe = Math.min(totalPages, Math.max(1, next));
    const href = safe <= 1 ? '/blog' : `/blog?page=${safe}`;
    router.push(href);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <SiteShell>
      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 40%, #2596be 100%)',
          paddingTop: '2.5rem',
          paddingBottom: '2.5rem',
        }}
      >
        <div
          className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-15 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #7dd3fc, transparent)', transform: 'translate(25%,-40%)' }}
        />
        <div
          className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #2596be, transparent)', transform: 'translate(-30%,40%)' }}
        />
        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 text-center">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
            style={{ background: 'rgba(37,150,190,0.2)', color: '#7dd3fc', border: '1px solid rgba(125,211,252,0.25)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
            GoDocLab Blog
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Articles &amp; Insights
          </h1>
          <p className="mt-3 text-sm sm:text-base max-w-xl mx-auto leading-relaxed" style={{ color: '#94a3b8' }}>
            Tips, guides, and updates on PDF tools, digital workflows, and growing your business online.
          </p>
          {!loading && posts.length > 0 && (
            <p className="mt-4 text-xs font-semibold uppercase tracking-wider" style={{ color: '#7dd3fc' }}>
              {posts.length} {posts.length === 1 ? 'Article' : 'Articles'} published
            </p>
          )}
        </div>
      </section>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-10 sm:py-12">
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <BlogCardSkeleton key={n} />
            ))}
          </div>
        )}

        {error && (
          <div className="py-8 px-4 rounded-xl bg-red-50 text-red-700 text-sm border border-red-100 text-center max-w-lg mx-auto">
            {error}
          </div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className="py-20 text-center">
            <div className="text-4xl mb-4">📭</div>
            <p className="text-gray-500 text-sm">No published posts yet. Check back soon!</p>
          </div>
        )}

        {!loading && !error && posts.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pagePosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} onPage={goToPage} />
          </>
        )}
      </main>
    </SiteShell>
  );
}
