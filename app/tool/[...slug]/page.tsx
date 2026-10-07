import type { Metadata } from 'next';
import { TOOLS } from '../../lib/tools';
import ToolClient from './ToolClient';
import { JsonLd } from '../../components/JsonLd';
import { breadcrumbLd } from '../../lib/json-ld';
import { getSiteUrl } from '../../lib/site';

function slugFromParams(slug: string | string[]) {
  return Array.isArray(slug) ? slug.join('/') : slug;
}

export function generateStaticParams() {
  return TOOLS.map((tool) => ({ slug: tool.slug.split('/') }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string[] }> },
): Promise<Metadata> {
  const { slug: parts } = await params;
  const slug = slugFromParams(parts);
  const tool = TOOLS.find((t) => t.slug === slug);
  if (!tool) return { title: 'Tool Not Found | GoDocLab' };

  const title       = tool.seoTitle       ?? `${tool.name} — Free Online Tool | GoDocLab`;
  const description = tool.seoDescription ?? tool.description;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://godoclab.com/tool/${slug}`,
      siteName: 'GoDocLab',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    alternates: {
      canonical: `https://godoclab.com/tool/${slug}`,
    },
  };
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug: parts } = await params;
  const slug = slugFromParams(parts);
  const tool = TOOLS.find((t) => t.slug === slug);

  const site = getSiteUrl();
  const toolUrl = `${site}/tool/${slug}`;
  const schema = tool
    ? {
        '@context': 'https://schema.org',
        '@type': ['SoftwareApplication', 'WebApplication'],
        name: tool.name,
        url: toolUrl,
        description: tool.seoDescription ?? tool.description,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        publisher: { '@id': `${site}/#organization` },
      }
    : null;
  const crumbs = tool
    ? breadcrumbLd([
        { name: 'Home', url: `${site}/` },
        { name: 'Tools', url: `${site}/tools` },
        { name: tool.name, url: toolUrl },
      ])
    : null;

  return (
    <>
      {schema && <JsonLd data={schema} />}
      {crumbs && <JsonLd data={crumbs} />}
      <ToolClient slug={slug} />
    </>
  );
}
