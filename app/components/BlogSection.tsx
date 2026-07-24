'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { fetchPublishedPosts, type BlogPost } from '../admin/lib/posts-api';

type BlogDisplayItem = {
  id: string;
  title: string;
  href: string;
  excerpt: string;
  author: string;
  createdAt: string;
  category: string;
  readTime: number;
  gradient: string;
  glow: string;
  icon: 'spark' | 'pdf' | 'scan' | 'image';
  image: string;
};

const CARD_STYLES = [
  {
    gradient: 'linear-gradient(145deg, #020617 0%, #1e3a5f 45%, #2596be 100%)',
    glow: '#2596be',
    icon: 'pdf' as const,
    fallbackImage: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop&q=80',
  },
  {
    gradient: 'linear-gradient(145deg, #0f172a 0%, #312e81 50%, #6366f1 100%)',
    glow: '#6366f1',
    icon: 'spark' as const,
    fallbackImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=80',
  },
  {
    gradient: 'linear-gradient(145deg, #042f2e 0%, #134e4a 50%, #14b8a6 100%)',
    glow: '#14b8a6',
    icon: 'scan' as const,
    fallbackImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=80',
  },
  {
    gradient: 'linear-gradient(145deg, #4a044e 0%, #86198f 50%, #db2777 100%)',
    glow: '#db2777',
    icon: 'image' as const,
    fallbackImage: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&auto=format&fit=crop&q=80',
  },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function estimateReadTime(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function postToDisplay(post: BlogPost, index: number): BlogDisplayItem {
  const style = CARD_STYLES[index % CARD_STYLES.length];
  return {
    id: post.id,
    title: post.title,
    href: `/blog/${post.slug}`,
    excerpt: post.excerpt || post.seoDescription || 'Read the full article on our blog.',
    author: post.author,
    createdAt: post.createdAt,
    category: 'Article',
    readTime: estimateReadTime(post.excerpt || post.content || post.title),
    gradient: style.gradient,
    glow: style.glow,
    icon: style.icon,
    image: post.featuredImage?.trim() || style.fallbackImage,
  };
}

/** Newest published posts first — homepage shows only the latest 4. */
function buildLatestPosts(apiPosts: BlogPost[]): BlogDisplayItem[] {
  return [...apiPosts]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4)
    .map(postToDisplay);
}

function CardIcon({ type, small }: { type: BlogDisplayItem['icon']; small?: boolean }) {
  const cls = small ? 'w-5 h-5 text-white' : 'w-6 h-6 text-white';
  if (type === 'pdf') {
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="8" y1="13" x2="16" y2="13" />
        <line x1="8" y1="17" x2="13" y2="17" />
      </svg>
    );
  }
  if (type === 'scan') {
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M4 7V4h3M20 7V4h-3M4 17v3h3M20 17v3h-3" strokeLinecap="round" />
        <rect x="7" y="7" width="10" height="10" rx="1" />
      </svg>
    );
  }
  if (type === 'image') {
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" strokeLinejoin="round" />
      <path d="M5 19l1 2M19 19l-1 2M3 12H1M23 12h-2" strokeLinecap="round" />
    </svg>
  );
}

function BlogCard({ post }: { post: BlogDisplayItem }) {
  return (
    <article className="group relative flex flex-col h-full rounded-2xl bg-white border border-slate-200/80 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(37,150,190,0.15)] hover:border-[#2596be]/30">
      <Link href={post.href} className="flex flex-col h-full">
        <div className="relative h-48 overflow-hidden">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
            unoptimized
          />
          <div
            className="absolute inset-0 mix-blend-multiply opacity-70"
            style={{ background: post.gradient }}
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0.25) 50%, transparent 100%)' }}
          />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          <div className="absolute top-4 left-4 z-10">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white/95 bg-black/30 border border-white/20 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {post.category}
            </span>
          </div>

          <div className="absolute bottom-4 right-4 z-10">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/25 bg-white/10"
              style={{ boxShadow: `0 4px 20px ${post.glow}55` }}
            >
              <CardIcon type={post.icon} small />
            </div>
          </div>
        </div>

        <div className="flex flex-col flex-1 p-5 sm:p-6">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider mb-3">
            <time dateTime={post.createdAt} className="text-[#2596be]">
              {formatDate(post.createdAt)}
            </time>
            <span className="text-slate-300">·</span>
            <span className="text-slate-400">{post.readTime} min read</span>
          </div>

          <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-[#2596be] transition-colors">
            {post.title}
          </h3>

          <p className="mt-2.5 text-sm text-slate-500 leading-relaxed line-clamp-2 flex-1">
            {post.excerpt}
          </p>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <span className="text-xs text-slate-400 truncate">By {post.author}</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-[#2596be] bg-[#2596be]/8 group-hover:bg-[#2596be] group-hover:text-white transition-all shrink-0">
              Read
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

function BlogCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 overflow-hidden animate-pulse bg-white">
      <div className="h-48 bg-slate-200" />
      <div className="p-6 space-y-3">
        <div className="h-3 w-28 bg-slate-200 rounded" />
        <div className="h-5 w-full bg-slate-200 rounded" />
        <div className="h-4 w-full bg-slate-100 rounded" />
      </div>
    </div>
  );
}

export function BlogSection() {
  const [apiPosts, setApiPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublishedPosts()
      .then(setApiPosts)
      .catch(() => setApiPosts([]))
      .finally(() => setLoading(false));
  }, []);

  const blogs = useMemo(() => buildLatestPosts(apiPosts), [apiPosts]);

  return (
    <section className="relative py-14 sm:py-20 overflow-hidden bg-[#f4f6f8] border-t border-slate-200/80">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#2596be]/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#7c3aed]/5 blur-3xl" />
      </div>

      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest text-[#2596be] bg-white border border-[#2596be]/20 shadow-sm mb-4">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" strokeLinejoin="round" />
              </svg>
              Blog &amp; Insights
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3">
              Latest{' '}
              <span className="bg-gradient-to-r from-[#2596be] to-[#6366f1] bg-clip-text text-transparent">
                Articles
              </span>
            </h2>
            <p className="text-base text-slate-500 leading-relaxed">
              Expert guides on PDF tools, AI-powered workflows and digital productivity.
            </p>
          </div>

          <Link
            href="/blog"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white shrink-0 self-start sm:self-auto transition-all hover:-translate-y-0.5"
            style={{
              background: 'linear-gradient(135deg, #2596be 0%, #6366f1 100%)',
              boxShadow: '0 8px 28px rgba(37,150,190,0.35)',
            }}
          >
            View All Articles
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 sm:gap-6">
            {[1, 2, 3, 4].map((n) => (
              <BlogCardSkeleton key={n} />
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 px-6 py-14 text-center">
            <p className="text-sm font-semibold text-slate-700">No published articles yet</p>
            <p className="text-sm text-slate-500 mt-1">Publish a blog post to see it here automatically.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 sm:gap-6">
            {blogs.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
