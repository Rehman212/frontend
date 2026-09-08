const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.godoclab.com/api';

export const MAX_FEATURED_IMAGE_BYTES = 100 * 1024; // 100KB

export interface BlogFaq {
  question: string;
  answer: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: 'published' | 'draft';
  author: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  featuredImage: string;
  faqs?: BlogFaq[];
  createdAt: string;
  updatedAt: string;
}

export type PostPayload = {
  title: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  status?: 'draft' | 'published';
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  featuredImage?: string;
  faqs?: BlogFaq[];
};

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

async function parseError(res: Response, fallback: string) {
  try {
    const data = await res.json();
    if (typeof data?.message === 'string') return data.message;
    if (Array.isArray(data?.message)) return data.message.join(', ');
  } catch { /* ignore */ }
  return fallback;
}

export async function fetchPosts(token: string): Promise<BlogPost[]> {
  const res = await fetch(`${API}/admin/posts`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error(await parseError(res, 'Failed to load posts'));
  return res.json();
}

export async function fetchPost(token: string, id: string): Promise<BlogPost> {
  const res = await fetch(`${API}/admin/posts/${id}`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error(await parseError(res, 'Failed to load post'));
  return res.json();
}

async function bumpSitemap(token: string) {
  try {
    await fetch('/api/revalidate-sitemap', {
      method: 'POST',
      headers: authHeaders(token),
    });
  } catch {
    /* ignore */
  }
}

export async function createPost(token: string, payload: PostPayload): Promise<BlogPost> {
  const res = await fetch(`${API}/admin/posts`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await parseError(res, 'Failed to create post'));
  const post = (await res.json()) as BlogPost;
  if (payload.status === 'published') await bumpSitemap(token);
  return post;
}

export async function updatePost(token: string, id: string, payload: PostPayload): Promise<BlogPost> {
  const res = await fetch(`${API}/admin/posts/${id}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await parseError(res, 'Failed to update post'));
  const post = (await res.json()) as BlogPost;
  await bumpSitemap(token);
  return post;
}

export async function deletePost(token: string, id: string): Promise<void> {
  const res = await fetch(`${API}/admin/posts/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(await parseError(res, 'Failed to delete post'));
  await bumpSitemap(token);
}

/** Upload featured image to S3 via backend API — WebP only, max 100KB.
 *  Uses public S3 URL so images work on both local and live site. */
export async function uploadFeaturedImage(token: string, file: File): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch(`${API}/admin/posts/featured-image`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });
  if (!res.ok) throw new Error(await parseError(res, 'Failed to upload featured image'));
  const data = (await res.json()) as { url: string };
  return data.url;
}

/** Public — published posts only (no auth) */
export async function fetchPublishedPosts(): Promise<BlogPost[]> {
  const res = await fetch(`${API}/posts`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load blog posts');
  return res.json();
}

export async function fetchPublishedPostBySlug(slug: string): Promise<BlogPost | null> {
  const res = await fetch(`${API}/posts/${encodeURIComponent(slug)}`, { cache: 'no-store' });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to load post');
  return res.json();
}

export async function fetchSiteSettings(): Promise<{ blogPostsPerPage: number }> {
  try {
    const res = await fetch(`${API}/site-settings`, { cache: 'no-store' });
    if (!res.ok) return { blogPostsPerPage: 9 };
    const data = (await res.json()) as { blogPostsPerPage?: number };
    const n = Number(data.blogPostsPerPage);
    if (!Number.isFinite(n)) return { blogPostsPerPage: 9 };
    return { blogPostsPerPage: Math.min(48, Math.max(3, Math.round(n))) };
  } catch {
    return { blogPostsPerPage: 9 };
  }
}

export async function updateSiteSettings(
  token: string,
  payload: { blogPostsPerPage: number },
): Promise<{ blogPostsPerPage: number }> {
  const res = await fetch(`${API}/admin/site-settings`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await parseError(res, 'Failed to save site settings'));
  return res.json();
}
