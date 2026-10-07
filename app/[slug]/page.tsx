import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { CmsPageViewerSuspense } from '../components/CmsPageViewer';
import { SiteShell } from '../components/SiteShell';
import { CMS_RESERVED_SLUGS, type CmsPage } from '../admin/lib/cms-store';
import { fetchPublishedPageBySlug } from '../admin/lib/pages-api';
import { normalizeBlogContent } from '../lib/blog-html';
import {
  cmsContentIsUsable,
  getTrustPage,
  trustPageSlugs,
} from '../lib/trust-pages';
import { getSiteUrl, htmlToMetaDescription, normalizeSlug } from '../lib/site';
import { JsonLd } from '../components/JsonLd';
import { breadcrumbLd } from '../lib/json-ld';
import cmsSlugs from '../../public/cms-slugs.json';

export const dynamic = 'force-dynamic';

function uniqueSlugs() {
  return [...new Set([...(cmsSlugs as string[]), ...trustPageSlugs()])].filter(
    (slug) => slug && !CMS_RESERVED_SLUGS.has(slug),
  );
}

export function generateStaticParams() {
  return uniqueSlugs().map((slug) => ({ slug }));
}

async function loadCmsPage(slug: string): Promise<CmsPage | null> {
  try {
    return await fetchPublishedPageBySlug(slug);
  } catch {
    return null;
  }
}

async function resolvePage(rawSlug: string) {
  const slug = normalizeSlug(rawSlug);
  if (!slug || CMS_RESERVED_SLUGS.has(slug)) return null;

  const trust = getTrustPage(slug);
  const cmsTried = new Set<string>();
  const cmsCandidates = [slug, trust?.slug, ...(trust?.aliases ?? [])].filter(
    (s): s is string => Boolean(s),
  );

  let cms: CmsPage | null = null;
  for (const candidate of cmsCandidates) {
    if (cmsTried.has(candidate)) continue;
    cmsTried.add(candidate);
    cms = await loadCmsPage(candidate);
    if (cms) break;
  }

  if (cms && cmsContentIsUsable(cms.content)) {
    return {
      slug: trust?.slug || cms.slug || slug,
      title: cms.title,
      seoTitle: cms.seoTitle?.trim() || cms.title,
      seoDescription:
        cms.seoDescription?.trim() ||
        htmlToMetaDescription(cms.content) ||
        cms.title,
      content: cms.content,
    };
  }

  if (trust) {
    return {
      slug: trust.slug,
      title: trust.title,
      seoTitle: trust.seoTitle,
      seoDescription: trust.seoDescription,
      content: trust.content,
    };
  }

  if (cms) {
    return {
      slug: cms.slug || slug,
      title: cms.title,
      seoTitle: cms.seoTitle?.trim() || cms.title,
      seoDescription: cms.seoDescription?.trim() || htmlToMetaDescription(cms.content) || cms.title,
      content: cms.content || '<p>No content yet.</p>',
    };
  }

  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug: raw } = await params;
  const page = await resolvePage(raw);
  if (!page) {
    return { title: 'Page not found — GoDocLab', robots: { index: false, follow: false } };
  }

  const canonical = `${getSiteUrl()}/${page.slug}`;
  const title = page.seoTitle.includes('GoDocLab') ? page.seoTitle : `${page.seoTitle} | GoDocLab`;

  return {
    title,
    description: page.seoDescription,
    robots: { index: true, follow: true },
    alternates: { canonical },
    openGraph: {
      title,
      description: page.seoDescription,
      url: canonical,
      type: 'website',
      siteName: 'GoDocLab',
    },
  };
}

export default async function CmsSlugPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string | string[] }>;
}) {
  const { slug: raw } = await params;
  const slug = normalizeSlug(raw);
  if (!slug || CMS_RESERVED_SLUGS.has(slug)) notFound();

  const query = await searchParams;
  const previewRaw = Array.isArray(query.preview) ? query.preview[0] : query.preview;
  if (previewRaw === '1') {
    return <CmsPageViewerSuspense slug={slug} />;
  }

  const trust = getTrustPage(slug);
  if (trust && slug !== trust.slug) {
    redirect(`/${trust.slug}`);
  }

  const page = await resolvePage(slug);
  if (!page) notFound();

  const body = normalizeBlogContent(page.content);
  const canonical = `${getSiteUrl()}/${page.slug}`;

  return (
    <SiteShell>
      <article className="max-w-4xl mx-auto px-4 py-10 sm:py-14">
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: page.title,
            description: page.seoDescription,
            url: canonical,
            isPartOf: { '@id': `${getSiteUrl()}/#website` },
          }}
        />
        <JsonLd
          data={breadcrumbLd([
            { name: 'Home', url: `${getSiteUrl()}/` },
            { name: page.title, url: canonical },
          ])}
        />
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-8">{page.title}</h1>
        <div
          className="prose-page text-gray-700 text-[15px] leading-relaxed"
          dangerouslySetInnerHTML={{ __html: body }}
        />
      </article>
    </SiteShell>
  );
}
