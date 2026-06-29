'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SiteShell } from '../components/SiteShell';
import { fetchPublishedPosts, type BlogPost } from '../admin/lib/posts-api';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function BlogCard({ post }: { post: BlogPost }) {
  return (
    <article className="group flex flex-col h-full bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <Link href={`/blog/${post.slug}`} className="flex flex-col h-full">
        <div
          className="relative h-36 flex items-center justify-center overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #112240 0%, #1e3a5f 50%, #2596be 100%)' }}
        >
          <div
            className="absolute inset-0 opacity-20"
            style={{ background: 'radial-gradient(circle at 80% 20%, #7dd3fc, transparent 55%)' }}
          />
          <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center text-2xl bg-white/15 backdrop-blur-sm border border-white/20">
            📝
          </div>
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
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPublishedPosts()
      .then(setPosts)
      .catch(() => setError('Could not load blog posts.'))
      .finally(() => setLoading(false));
  }, []);

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </main>
    </SiteShell>
  );
}
