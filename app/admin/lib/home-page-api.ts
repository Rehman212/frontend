import {
  mergeHomePage,
  type HomePageContent,
} from '../../lib/home-page';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.godoclab.com/api';

export async function fetchHomePageContent(): Promise<HomePageContent> {
  try {
    const res = await fetch(`${API}/site-settings`, { cache: 'no-store' });
    if (!res.ok) return mergeHomePage(null);
    const data = (await res.json()) as { homepage?: Partial<HomePageContent> };
    return mergeHomePage(data.homepage);
  } catch {
    return mergeHomePage(null);
  }
}

export async function saveHomePageContent(
  token: string,
  homepage: HomePageContent,
): Promise<HomePageContent> {
  const res = await fetch(`${API}/admin/site-settings`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ homepage }),
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(data.message || 'Failed to save homepage');
  }
  const data = (await res.json()) as { homepage?: Partial<HomePageContent> };
  return mergeHomePage(data.homepage);
}
