import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.godoclab.com/api';
const SLUGS_PATH = path.join(process.cwd(), 'public', 'cms-slugs.json');

const RESERVED = new Set([
  'admin', 'login', 'signup', 'dashboard', 'auth', 'tool', 'p', 'api', 'blog',
  'favicon.ico', 'icon.png', 'logo.webp', 'robots.txt', 'sitemap.xml',
]);

async function assertAdmin(token: string) {
  const res = await fetch(`${API}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) return false;
  const user = (await res.json()) as { role?: string };
  return user.role === 'admin';
}

function normalizeSlugs(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of input) {
    if (typeof item !== 'string') continue;
    const slug = item.trim().replace(/^\/+|\/+$/g, '').toLowerCase();
    if (!slug || RESERVED.has(slug) || seen.has(slug)) continue;
    seen.add(slug);
    out.push(slug);
  }
  return out;
}

export async function GET() {
  try {
    const raw = await readFile(SLUGS_PATH, 'utf8');
    const data = JSON.parse(raw) as unknown;
    return NextResponse.json(normalizeSlugs(data));
  } catch {
    return NextResponse.json([]);
  }
}

/** Sync published CMS page slugs into sitemap source + revalidate sitemap.xml */
export async function PUT(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!token || !(await assertAdmin(token))) {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    const body = (await req.json()) as { slugs?: unknown };
    const slugs = normalizeSlugs(body.slugs);
    await writeFile(SLUGS_PATH, JSON.stringify(slugs, null, 2) + '\n', 'utf8');
    revalidatePath('/sitemap.xml');
    return NextResponse.json({ ok: true, slugs });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to sync CMS slugs';
    return NextResponse.json({ message }, { status: 500 });
  }
}
