import type { MetadataRoute } from 'next';
import { TOOLS } from './lib/tools';
import cmsSlugs from '../public/cms-slugs.json';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://godoclab.com').replace(/\/$/, '');
const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.godoclab.com/api';

/** Refresh sitemap at most every hour so new posts/pages appear automatically. */
export const revalidate = 3600;

type PublishedPost = {
  slug: string;
  updatedAt?: string;
  createdAt?: string;
};

async function fetchPublishedPosts(): Promise<PublishedPost[]> {
  try {
    const res = await fetch(`${API}/posts`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    return (await res.json()) as PublishedPost[];
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

  const posts = await fetchPublishedPosts();
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

  const pageRoutes: MetadataRoute.Sitemap = (cmsSlugs as string[]).map((slug) => ({
    url: `${SITE_URL}/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...toolRoutes, ...postRoutes, ...pageRoutes];
}
