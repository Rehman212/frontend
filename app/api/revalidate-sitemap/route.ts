import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export const runtime = 'nodejs';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.godoclab.com/api';

async function assertAdmin(token: string) {
  const res = await fetch(`${API}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) return false;
  const user = (await res.json()) as { role?: string };
  return user.role === 'admin';
}

/** Force sitemap.xml to rebuild after publishing blog posts */
export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!token || !(await assertAdmin(token))) {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    revalidatePath('/sitemap.xml');
    return NextResponse.json({ ok: true, revalidated: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to revalidate sitemap';
    return NextResponse.json({ message }, { status: 500 });
  }
}
