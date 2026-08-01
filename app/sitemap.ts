import type { MetadataRoute } from 'next';
import { readFile } from 'fs/promises';
import path from 'path';
import { TOOLS } from './lib/tools';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://godoclab.com').replace(/\/$/, '');
const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.godoclab.com/api';

/** Always rebuild from live posts + cms-slugs.json (updated on page publish). */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type PublishedPost = {
  slug: string;
  updatedAt?: string;
  createdAt?: string;
};

async function fetchPublishedPosts(): Promise<PublishedPost[]> {
  try {
    const res = await fetch(`${API}/posts`, { cache: 'no-store' });
    if (!res.ok) return [];
    return (await res.json()) as PublishedPost[];
  } catch {
    return [];
  }
}

/** Read slugs from disk at request time (static import stays stale after sync). */
async function fetchCmsPageSlugs(): Promise<string[]> {
  try {
    const raw = await readFile(path.join(process.cwd(), 'public', 'cms-slugs.json'), 'utf8');
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    return data.filter((s): s is string => typeof s === 'string' && s.trim().length > 0);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/login`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/signup`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  const toolRoutes: MetadataRoute.Sitemap = TOOLS.map((tool) => ({
    url: `${SITE_URL}/tool/${tool.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const [posts, cmsSlugs] = await Promise.all([
    fetchPublishedPosts(),
    fetchCmsPageSlugs(),
  ]);

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.updatedAt
      ? new Date(post.updatedAt)
      : post.createdAt
        ? new Date(post.createdAt)
        : now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const pageRoutes: MetadataRoute.Sitemap = cmsSlugs.map((slug) => ({
    url: `${SITE_URL}/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...toolRoutes, ...postRoutes, ...pageRoutes];
}
