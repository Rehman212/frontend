import Link from 'next/link';
import type { Metadata } from 'next';
import { SiteShell } from '../components/SiteShell';
import {
  fetchPublishedPosts,
  fetchSiteSettings,
  type BlogPost,
} from '../admin/lib/posts-api';
import { blogPostPath, getSiteUrl } from '../lib/site';

export const dynamic = 'force-dynamic';

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

function parsePage(raw: string | string[] | undefined) {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return Math.max(1, parseInt(value || '1', 10) || 1);
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const page = parsePage(params.page);
  const site = getSiteUrl();
  const canonical = page <= 1 ? `${site}/blog` : `${site}/blog?page=${page}`;
  const title = page <= 1 ? 'Blog — GoDocLab' : `Blog — Page ${page} | GoDocLab`;
  return {
    title,
    description:
      'Tips, guides, and updates on PDF tools, digital workflows, and growing your business online.',
    alternates: { canonical },
    openGraph: {
      title,
      description: 'GoDocLab blog — free PDF and image tool guides.',
      url: canonical,
      type: 'website',
    },
  };
}

function BlogCard({ post }: { post: BlogPost }) {
  const href = blogPostPath(post.slug);
  return (
    <article className="group flex flex-col h-full bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <Link href={href} className="flex flex-col h-full">
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
                style={{ background: 'radial-gradient(circle, #7dd3fc, transparent)', transform: 'translate(25%,-40%)' }}
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

function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  if (totalPages <= 1) return null;
  const pages = pageWindow(page, totalPages);
  const hrefFor = (p: number) => (p <= 1 ? '/blog' : `/blog?page=${p}`);
  const btn =
    'inline-flex items-center justify-center min-h-10 min-w-10 px-3 rounded-lg text-sm font-semibold border border-gray-200 bg-white text-gray-700 hover:border-[#2596be] hover:text-[#2596be]';

  return (
    <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Blog pagination">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className={`${btn} px-3.5`}>
          Previous
        </Link>
      ) : (
        <span className={`${btn} px-3.5 opacity-40`}>Previous</span>
      )}
      {pages[0] > 1 && (
        <>
          <Link href={hrefFor(1)} className={btn}>
            1
          </Link>
          {pages[0] > 2 && <span className="px-1 text-gray-400">…</span>}
        </>
      )}
      {pages.map((p) =>
        p === page ? (
          <span
            key={p}
            className="inline-flex items-center justify-center min-h-10 min-w-10 px-3 rounded-lg text-sm font-semibold text-white"
            style={{ background: '#2596be' }}
            aria-current="page"
          >
            {p}
          </span>
        ) : (
          <Link key={p} href={hrefFor(p)} className={btn}>
            {p}
          </Link>
        ),
      )}
      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && <span className="px-1 text-gray-400">…</span>}
          <Link href={hrefFor(totalPages)} className={btn}>
            {totalPages}
          </Link>
        </>
      )}
      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} className={`${btn} px-3.5`}>
          Next
        </Link>
      ) : (
        <span className={`${btn} px-3.5 opacity-40`}>Next</span>
      )}
    </nav>
  );
}

export default async function BlogListingPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const params = await searchParams;
  const pageParam = parsePage(params.page);

  let posts: BlogPost[] = [];
  let perPage = 9;
  let error = '';

  try {
    const [list, settings] = await Promise.all([fetchPublishedPosts(), fetchSiteSettings()]);
    posts = list;
    perPage = settings.blogPostsPerPage;
  } catch {
    error = 'Could not load blog posts.';
  }

  const totalPages = Math.max(1, Math.ceil(posts.length / perPage));
  const page = Math.min(pageParam, totalPages);
  const pagePosts = posts.slice((page - 1) * perPage, page * perPage);

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
        <div
          className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-15 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #7dd3fc, transparent)', transform: 'translate(25%,-40%)' }}
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
          {posts.length > 0 && (
            <p className="mt-4 text-xs font-semibold uppercase tracking-wider" style={{ color: '#7dd3fc' }}>
              {posts.length} {posts.length === 1 ? 'Article' : 'Articles'} published
            </p>
          )}
        </div>
      </section>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-10 sm:py-12">
        {error && (
          <div className="py-8 px-4 rounded-xl bg-red-50 text-red-700 text-sm border border-red-100 text-center max-w-lg mx-auto">
            {error}
          </div>
        )}

        {!error && posts.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-gray-500 text-sm">No published posts yet. Check back soon!</p>
          </div>
        )}

        {!error && posts.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pagePosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} />
          </>
        )}
      </main>
    </SiteShell>
  );
}
