import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { SiteShell } from '../../components/SiteShell';
import { BlogFaqList } from '../../components/BlogFaqList';
import { BlogPostSidebar } from '../../components/BlogPostSidebar';
import {
  fetchPublishedPostBySlug,
  fetchPublishedPosts,
  type BlogPost,
} from '../../admin/lib/posts-api';
import { normalizeBlogContent } from '../../lib/blog-html';
import { estimateReadingMinutes, withHeadingAnchors } from '../../lib/blog-toc';
import { blogPostUrl, getSiteUrl, htmlToMetaDescription, normalizeSlug } from '../../lib/site';

export const dynamic = 'force-dynamic';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function pickRelated(all: BlogPost[], current: BlogPost, limit = 4) {
  return all
    .filter((p) => p.id !== current.id && p.slug !== current.slug)
    .slice(0, limit);
}

/** Remove editor inline aligns so CSS justify can apply. */
function forceJustifyHtml(html: string) {
  return html
    .replace(/\s*text-align\s*:\s*(left|start|center)\s*;?/gi, '')
    .replace(/\s*style="\s*"/gi, '');
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
  const description =
    post.seoDescription?.trim() ||
    post.excerpt?.trim() ||
    htmlToMetaDescription(post.content) ||
    `${post.title} — GoDocLab Blog`;
  const canonical = blogPostUrl(post.slug);
  const pageTitle = title.includes('GoDocLab') ? title : `${title} — GoDocLab Blog`;

  return {
    title: pageTitle,
    description,
    keywords: post.seoKeywords?.trim() || undefined,
    robots: { index: true, follow: true },
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

  let related: BlogPost[] = [];
  try {
    related = pickRelated(await fetchPublishedPosts(), post);
  } catch {
    related = [];
  }

  const faqs = post.faqs ?? [];
  const normalized = normalizeBlogContent(post.content || '<p>No content yet.</p>');
  const { html: anchored, toc } = withHeadingAnchors(normalized);
  const bodyHtml = forceJustifyHtml(anchored);
  const minutes = estimateReadingMinutes(normalized);
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

      {/* Magazine layout: image + title side-by-side, then body | rail */}
      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
        <nav
          className="mb-4 flex flex-wrap items-center gap-1.5 text-[12px] text-slate-500"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="hover:text-[#2596be] transition-colors">
            Home
          </Link>
          <span className="text-slate-300">/</span>
          <Link href="/blog" className="hover:text-[#2596be] transition-colors">
            Blog
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-700 font-medium truncate max-w-[min(100%,40rem)]">
            {post.title}
          </span>
        </nav>

        {/* Hero split: cover | title panel */}
        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div
            className={`relative min-h-[220px] sm:min-h-[280px] lg:min-h-[340px] ${
              post.featuredImage ? '' : 'bg-slate-900'
            }`}
          >
            {post.featuredImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={post.featuredImage}
                alt={post.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #2596be 100%)',
                }}
              />
            )}
          </div>

          <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10 bg-white">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex rounded bg-[#2596be] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                Blog
              </span>
              <span className="text-[12px] text-slate-500">{minutes} min read</span>
              <span className="text-slate-300">·</span>
              <time dateTime={post.createdAt} className="text-[12px] text-slate-500">
                {formatDate(post.createdAt)}
              </time>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-[2rem] xl:text-[2.25rem] font-black text-slate-900 tracking-tight leading-[1.15]">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="mt-3 text-sm sm:text-[15px] text-slate-600 leading-relaxed line-clamp-4">
                {post.excerpt}
              </p>
            )}

            <div className="mt-6 flex items-center gap-3 pt-5 border-t border-slate-100">
              <span
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                style={{ background: 'linear-gradient(135deg, #1e3a5f, #2596be)' }}
                aria-hidden
              >
                {(post.author || 'A').charAt(0).toUpperCase()}
              </span>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-slate-800">By {post.author}</p>
                <p className="text-[11px] text-slate-500">GoDocLab Editorial</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-7 grid lg:grid-cols-[minmax(0,1fr)_280px] gap-7 items-start">
          <article className="min-w-0 rounded-2xl border border-slate-200 bg-white px-5 py-6 sm:px-8 sm:py-8 shadow-sm">
            <div
              className="prose-page prose-blog text-slate-700 text-[16px] leading-[1.8]"
              dangerouslySetInnerHTML={{ __html: bodyHtml }}
            />

            <BlogFaqList faqs={faqs} />

            <div className="mt-10 pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2596be] hover:underline"
              >
                ← Back to blog
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold text-white"
                style={{ background: '#2596be' }}
              >
                Try free tools
              </Link>
            </div>
          </article>

          <BlogPostSidebar
            postTitle={post.title}
            postContent={post.content}
            toc={toc}
            related={related}
          />
        </div>
      </div>
    </SiteShell>
  );
}
