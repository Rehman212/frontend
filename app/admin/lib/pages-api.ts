import { cmsStore, type CmsPage } from './cms-store';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.godoclab.com/api';

export type PagePayload = {
  title: string;
  slug?: string;
  content?: string;
  status?: 'draft' | 'published';
  visibility?: 'public' | 'private';
  parentId?: string | null;
  template?: string;
  order?: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
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

const MIGRATED_KEY = 'cms_pages_migrated_v1';

/** Move this browser's localStorage pages into the shared database once. */
export async function migrateLocalPagesIfNeeded(token: string): Promise<void> {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem(MIGRATED_KEY) === '1') return;

  const local = cmsStore.getPages();
  if (!local.length) {
    localStorage.setItem(MIGRATED_KEY, '1');
    return;
  }

  const existing = await fetchPages(token).catch(() => [] as CmsPage[]);
  if (existing.length > 0) {
    localStorage.setItem(MIGRATED_KEY, '1');
    return;
  }

  const res = await fetch(`${API}/admin/pages/import`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({
      pages: local.map((p) => ({
        title: p.title,
        slug: p.slug,
        content: p.content,
        status: p.status,
        visibility: p.visibility,
        parentId: p.parentId,
        template: p.template,
        order: p.order,
        seoTitle: p.seoTitle,
        seoDescription: p.seoDescription,
        seoKeywords: p.seoKeywords,
      })),
    }),
  });
  if (res.ok) localStorage.setItem(MIGRATED_KEY, '1');
}

export async function fetchPages(token: string): Promise<CmsPage[]> {
  const res = await fetch(`${API}/admin/pages`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error(await parseError(res, 'Failed to load pages'));
  return res.json();
}

export async function fetchPage(token: string, id: string): Promise<CmsPage> {
  const res = await fetch(`${API}/admin/pages/${id}`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error(await parseError(res, 'Failed to load page'));
  return res.json();
}

export async function createPage(token: string, payload: PagePayload): Promise<CmsPage> {
  const res = await fetch(`${API}/admin/pages`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await parseError(res, 'Failed to create page'));
  return res.json();
}

export async function updatePage(token: string, id: string, payload: PagePayload): Promise<CmsPage> {
  const res = await fetch(`${API}/admin/pages/${id}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await parseError(res, 'Failed to update page'));
  return res.json();
}

export async function deletePage(token: string, id: string): Promise<void> {
  const res = await fetch(`${API}/admin/pages/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(await parseError(res, 'Failed to delete page'));
}

export async function fetchPublishedPages(): Promise<CmsPage[]> {
  const res = await fetch(`${API}/pages`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load pages');
  return res.json();
}

export async function fetchPublishedPageBySlug(slug: string): Promise<CmsPage | null> {
  const res = await fetch(`${API}/pages/${encodeURIComponent(slug)}`, { cache: 'no-store' });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to load page');
  return res.json();
}
