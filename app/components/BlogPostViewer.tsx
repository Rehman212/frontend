'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SiteShell } from './SiteShell';
import { fetchPublishedPostBySlug, type BlogPost } from '../admin/lib/posts-api';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function BlogFaqList({ faqs }: { faqs: { question: string; answer: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="mt-12 pt-10 border-t border-slate-200">
      <p className="text-xs font-semibold uppercase tracking-widest text-[#2596be] mb-2">FAQs</p>
      <h2 className="text-2xl font-black text-gray-900 mb-6">Frequently asked questions</h2>
      <div className="space-y-3">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={`${index}-${faq.question}`}
              className={`rounded-2xl border transition-all duration-200 ${
                isOpen
                  ? 'border-[#2596be]/40 bg-white shadow-[0_8px_30px_rgba(37,150,190,0.08)]'
                  : 'border-slate-200/80 bg-white'
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                aria-expanded={isOpen}
              >
                <span className={`text-sm sm:text-base font-bold ${isOpen ? 'text-[#2596be]' : 'text-slate-900'}`}>
                  {faq.question}
                </span>
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                    isOpen ? 'bg-[#2596be] text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </span>
              </button>
              {isOpen && (
                <p className="px-5 pb-5 text-sm text-slate-500 leading-relaxed border-t border-slate-100 pt-4">
                  {faq.answer}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function LoadingState() {
  return (
    <SiteShell>
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#2596be' }} />
      </div>
    </SiteShell>
  );
}

export function BlogPostViewer({ slug }: { slug: string }) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    fetchPublishedPostBySlug(slug)
      .then((data) => {
        if (!data) {
          setNotFound(true);
          setPost(null);
        } else {
          setPost(data);
          const pageTitle = data.seoTitle?.trim() || data.title;
          const pageDesc = data.seoDescription?.trim() || data.excerpt || '';
          document.title = `${pageTitle} — GoDocLab Blog`;
          let meta = document.querySelector('meta[name="description"]');
          if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute('name', 'description');
            document.head.appendChild(meta);
          }
          if (pageDesc) meta.setAttribute('content', pageDesc);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <LoadingState />;

  if (notFound || !post) {
    return (
      <SiteShell>
        <div className="flex flex-col items-center justify-center gap-4 px-4 py-32">
          <h1 className="text-2xl font-bold text-gray-800">Post not found</h1>
          <p className="text-gray-500 text-sm text-center max-w-sm">
            This blog post does not exist or is not published yet.
          </p>
          <Link href="/blog" className="text-sm font-semibold text-sky-600 hover:underline">← Back to blog</Link>
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <article className="max-w-4xl mx-auto px-4 py-10 sm:py-14">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#2596be] mb-2">Blog</p>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4 leading-tight">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
            <span>By {post.author}</span>
            <span>·</span>
            <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
          </div>
          {post.excerpt && (
            <p className="mt-4 text-lg text-gray-600 leading-relaxed border-l-4 pl-4" style={{ borderColor: '#2596be' }}>
              {post.excerpt}
            </p>
          )}
        </div>
        {post.featuredImage && (
          <div className="mb-8 rounded-2xl overflow-hidden border border-gray-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full max-h-[420px] object-cover"
            />
          </div>
        )}
        <div
          className="prose-page text-gray-700 text-[15px] leading-relaxed"
          dangerouslySetInnerHTML={{ __html: post.content || '<p>No content yet.</p>' }}
        />
        {post.faqs?.length > 0 && <BlogFaqList faqs={post.faqs} />}
        {post.faqs?.length > 0 && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: post.faqs.map((faq) => ({
                  '@type': 'Question',
                  name: faq.question,
                  acceptedAnswer: { '@type': 'Answer', text: faq.answer },
                })),
              }),
            }}
          />
        )}
      </article>
    </SiteShell>
  );
}
