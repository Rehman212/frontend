import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { SiteShell } from '../../components/SiteShell';
import { BlogFaqList } from '../../components/BlogFaqList';
import { fetchPublishedPostBySlug } from '../../admin/lib/posts-api';
import { normalizeBlogContent } from '../../lib/blog-html';
import { blogPostUrl, getSiteUrl, normalizeSlug } from '../../lib/site';

export const dynamic = 'force-dynamic';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug: raw } = await params;
  const slug = normalizeSlug(raw);
  const post = slug ? await fetchPublishedPostBySlug(slug) : null;
  if (!post) {
    return { title: 'Post not found — GoDocLab Blog' };
  }

  const title = post.seoTitle?.trim() || post.title;
  const description = post.seoDescription?.trim() || post.excerpt || '';
  const canonical = blogPostUrl(post.slug);
  const pageTitle = title.includes('GoDocLab') ? title : `${title} — GoDocLab Blog`;

  return {
    title: pageTitle,
    description,
    keywords: post.seoKeywords?.trim() || undefined,
    alternates: { canonical },
    openGraph: {
      title: pageTitle,
      description,
      url: canonical,
      type: 'article',
      images: post.featuredImage ? [{ url: post.featuredImage }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: raw } = await params;
  const slug = normalizeSlug(raw);
  if (!slug) notFound();

  if (raw !== slug && decodeURIComponent(raw) !== slug) {
    redirect(`/blog/${slug}`);
  }

  const post = await fetchPublishedPostBySlug(slug);
  if (!post) notFound();

  const cleanSlug = normalizeSlug(post.slug);
  if (cleanSlug && cleanSlug !== slug) {
    redirect(`/blog/${cleanSlug}`);
  }

  const faqs = post.faqs ?? [];
  const bodyHtml = normalizeBlogContent(post.content || '<p>No content yet.</p>');
  const canonical = blogPostUrl(post.slug);
  const title = post.seoTitle?.trim() || post.title;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description: post.seoDescription?.trim() || post.excerpt || '',
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
    author: { '@type': 'Person', name: post.author },
    publisher: { '@type': 'Organization', name: 'GoDocLab', url: getSiteUrl() },
    mainEntityOfPage: canonical,
    image: post.featuredImage || undefined,
  };

  const faqLd =
    faqs.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: { '@type': 'Answer', text: faq.answer },
          })),
        }
      : null;

  return (
    <SiteShell>
      <article className="max-w-4xl mx-auto px-4 py-10 sm:py-14">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {faqLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
          />
        )}
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
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />
        <BlogFaqList faqs={faqs} />
        <p className="mt-10">
          <Link href="/blog" className="text-sm font-semibold text-[#2596be] hover:underline">
            ← Back to blog
          </Link>
        </p>
      </article>
    </SiteShell>
  );
}
