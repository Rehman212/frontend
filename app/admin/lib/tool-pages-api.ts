const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.godoclab.com/api';

import type { ToolFaq, ToolFeature, ToolPageData } from '../../lib/tool-page-html';

export type { ToolPageData, ToolFaq, ToolFeature };

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
  } catch {
    /* ignore */
  }
  return fallback;
}

function normalize(raw: Partial<ToolPageData> & { slug: string }): ToolPageData {
  return {
    slug: raw.slug,
    heroTitle: raw.heroTitle ?? '',
    heroDescription: raw.heroDescription ?? '',
    content: raw.content ?? '',
    features: Array.isArray(raw.features) ? raw.features : [],
    faqs: Array.isArray(raw.faqs) ? raw.faqs : [],
    createdAt: raw.createdAt ?? null,
    updatedAt: raw.updatedAt ?? null,
    id: raw.id,
  };
}

export async function fetchToolPageContent(slug: string): Promise<ToolPageData> {
  const res = await fetch(`${API}/tool-pages/${encodeURIComponent(slug)}`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    return normalize({ slug });
  }
  return normalize(await res.json());
}

export async function fetchAdminToolPage(
  token: string,
  slug: string,
): Promise<ToolPageData> {
  const res = await fetch(`${API}/admin/tool-pages/${encodeURIComponent(slug)}`, {
    headers: authHeaders(token),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(await parseError(res, 'Failed to load tool page'));
  return normalize(await res.json());
}

export async function saveToolPageContent(
  token: string,
  slug: string,
  data: Partial<ToolPageData>,
): Promise<ToolPageData> {
  const res = await fetch(`${API}/admin/tool-pages/${encodeURIComponent(slug)}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify({
      heroTitle: data.heroTitle,
      heroDescription: data.heroDescription,
      content: data.content,
      features: data.features,
      faqs: data.faqs,
    }),
  });
  if (!res.ok) throw new Error(await parseError(res, 'Failed to save tool page'));
  return normalize(await res.json());
}

export async function deleteToolPageContent(
  token: string,
  slug: string,
): Promise<void> {
  const res = await fetch(`${API}/admin/tool-pages/${encodeURIComponent(slug)}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  if (!res.ok && res.status !== 404) {
    throw new Error(await parseError(res, 'Failed to delete tool page content'));
  }
}
