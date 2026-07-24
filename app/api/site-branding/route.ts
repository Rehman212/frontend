import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.godoclab.com/api';
const BRANDING_PATH = path.join(process.cwd(), 'public', 'site-branding.json');

export type SiteBranding = {
  headerLogo: string;
  footerLogo: string;
};

const DEFAULTS: SiteBranding = {
  headerLogo: '/Website_logo_1.2-RB.png',
  footerLogo: '/Website_logo_1.2-RB.png',
};

async function readBranding(): Promise<SiteBranding> {
  try {
    const raw = await readFile(BRANDING_PATH, 'utf8');
    const data = JSON.parse(raw) as Partial<SiteBranding>;
    return {
      headerLogo: data.headerLogo || DEFAULTS.headerLogo,
      footerLogo: data.footerLogo || DEFAULTS.footerLogo,
    };
  } catch {
    return { ...DEFAULTS };
  }
}

async function assertAdmin(token: string) {
  const res = await fetch(`${API}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) return false;
  const user = (await res.json()) as { role?: string };
  return user.role === 'admin';
}

export async function GET() {
  const branding = await readBranding();
  return NextResponse.json(branding);
}

export async function PUT(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!token || !(await assertAdmin(token))) {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    const body = (await req.json()) as Partial<SiteBranding>;
    const current = await readBranding();
    const next: SiteBranding = {
      headerLogo: typeof body.headerLogo === 'string' && body.headerLogo.trim()
        ? body.headerLogo.trim()
        : current.headerLogo,
      footerLogo: typeof body.footerLogo === 'string' && body.footerLogo.trim()
        ? body.footerLogo.trim()
        : current.footerLogo,
    };

    await writeFile(BRANDING_PATH, JSON.stringify(next, null, 2), 'utf8');
    return NextResponse.json(next);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to save branding';
    return NextResponse.json({ message }, { status: 500 });
  }
}
