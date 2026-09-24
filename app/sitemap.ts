import type { MetadataRoute } from 'next';
import { TOOLS } from './lib/tools';
import { blogPostUrl, getSiteUrl, normalizeSlug } from './lib/site';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.godoclab.com/api';

/** Always rebuild from live posts + CMS pages. */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type SitemapPost = {
  slug: string;
  updatedAt?: string;
  createdAt?: string;
};

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
    // Prefer ultra-light endpoint; fall back to slim /posts list
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

async function fetchPublishedPageSlugs(): Promise<string[]> {
  try {
    const res = await fetch(`${API}/pages`, { cache: 'no-store' });
    if (!res.ok) return [];
    const pages = (await res.json()) as { slug?: string }[];
    return pages
      .map((p) => normalizeSlug(p.slug ?? ''))
      .filter(Boolean);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const site = getSiteUrl();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${site}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${site}/blog`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${site}/tools`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
  ];

  const toolRoutes: MetadataRoute.Sitemap = TOOLS.map((tool) => ({
    url: `${site}/tool/${tool.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const [posts, cmsSlugs] = await Promise.all([
    fetchSitemapPosts(),
    fetchPublishedPageSlugs(),
  ]);

  const postRoutes: MetadataRoute.Sitemap = posts
    .map((post) => {
      const slug = normalizeSlug(post.slug);
      if (!slug) return null;
      return {
        url: blogPostUrl(slug),
        lastModified: post.updatedAt
          ? new Date(post.updatedAt)
          : post.createdAt
            ? new Date(post.createdAt)
            : now,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      };
    })
    .filter((row): row is NonNullable<typeof row> => !!row);

  const pageRoutes: MetadataRoute.Sitemap = cmsSlugs.map((slug) => ({
    url: `${site}/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return uniqueUrls([...staticRoutes, ...toolRoutes, ...postRoutes, ...pageRoutes]);
}
