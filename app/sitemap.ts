import type { MetadataRoute } from 'next';
import { TOOLS } from './lib/tools';
import { blogPostUrl, getSiteUrl, normalizeSlug } from './lib/site';
import { trustPageSlugs } from './lib/trust-pages';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.godoclab.com/api';

/** Trust copy lives in source — bump when those pages change. */
const TRUST_UPDATED = new Date('2026-10-07T00:00:00.000Z');

/** Always rebuild from live posts + CMS pages. */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type SitemapPost = {
  slug: string;
  updatedAt?: string;
  createdAt?: string;
};

type SitemapPage = {
  slug?: string;
  updatedAt?: string;
  createdAt?: string;
};

function parseDate(value?: string | null): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function uniqueUrls(entries: MetadataRoute.Sitemap): MetadataRoute.Sitemap {
  const seen = new Set<string>();
  const out: MetadataRoute.Sitemap = [];
  for (const entry of entries) {
    let url = entry.url;
    try {
      const parsed = new URL(url);
      parsed.pathname = parsed.pathname.replace(/\/{2,}/g, '/');
      if (parsed.pathname.length > 1) {
        parsed.pathname = parsed.pathname.replace(/\/$/, '');
      }
      url = parsed.toString();
    } catch {
      /* keep original */
    }
    if (seen.has(url)) continue;
    seen.add(url);
    out.push({ ...entry, url });
  }
  return out;
}

async function fetchSitemapPosts(): Promise<SitemapPost[]> {
  try {
    let res = await fetch(`${API}/posts/sitemap`, { cache: 'no-store' });
    if (!res.ok) {
      res = await fetch(`${API}/posts`, { cache: 'no-store' });
    }
    if (!res.ok) return [];
    return (await res.json()) as SitemapPost[];
  } catch {
    return [];
  }
}

async function fetchPublishedPages(): Promise<SitemapPage[]> {
  try {
    const res = await fetch(`${API}/pages`, { cache: 'no-store' });
    if (!res.ok) return [];
    return (await res.json()) as SitemapPage[];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = getSiteUrl();
  const [posts, cmsPages] = await Promise.all([
    fetchSitemapPosts(),
    fetchPublishedPages(),
  ]);

  const latestPost = posts.reduce<Date | undefined>((latest, post) => {
    const d = parseDate(post.updatedAt) ?? parseDate(post.createdAt);
    if (!d) return latest;
    if (!latest || d > latest) return d;
    return latest;
  }, undefined);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${site}/`, lastModified: new Date() },
    { url: `${site}/blog`, ...(latestPost ? { lastModified: latestPost } : {}) },
    { url: `${site}/tools` },
  ];

  const toolRoutes: MetadataRoute.Sitemap = TOOLS.map((tool) => ({
    url: `${site}/tool/${tool.slug}`,
  }));

  const trustRoutes: MetadataRoute.Sitemap = trustPageSlugs().map((slug) => ({
    url: `${site}/${slug}`,
    lastModified: TRUST_UPDATED,
  }));

  const postRoutes: MetadataRoute.Sitemap = posts
    .map((post) => {
      const slug = normalizeSlug(post.slug);
      if (!slug) return null;
      const lastModified = parseDate(post.updatedAt) ?? parseDate(post.createdAt);
      return {
        url: blogPostUrl(slug),
        ...(lastModified ? { lastModified } : {}),
      };
    })
    .filter((row): row is NonNullable<typeof row> => !!row);

  const pageRoutes: MetadataRoute.Sitemap = cmsPages
    .map((page) => {
      const slug = normalizeSlug(page.slug ?? '');
      if (!slug) return null;
      const lastModified = parseDate(page.updatedAt) ?? parseDate(page.createdAt);
      return {
        url: `${site}/${slug}`,
        ...(lastModified ? { lastModified } : {}),
      };
    })
    .filter((row): row is NonNullable<typeof row> => !!row);

  return uniqueUrls([
    ...staticRoutes,
    ...trustRoutes,
    ...toolRoutes,
    ...postRoutes,
    ...pageRoutes,
  ]);
}
