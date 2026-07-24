import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { randomBytes } from 'crypto';

export const runtime = 'nodejs';

const MAX_BYTES = 500 * 1024; // 500KB for logos
const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.godoclab.com/api';

const ALLOWED: Record<string, string> = {
  'image/png': 'png',
  'image/webp': 'webp',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/svg+xml': 'svg',
};

async function assertAdmin(token: string) {
  const res = await fetch(`${API}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok) return false;
  const user = (await res.json()) as { role?: string };
  return user.role === 'admin';
}

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!token || !(await assertAdmin(token))) {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    const form = await req.formData();
    const file = form.get('file');
    const kind = String(form.get('kind') || 'logo');
    if (!(file instanceof File)) {
      return NextResponse.json({ message: 'Image file is required' }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ message: 'Logo must be 500KB or smaller' }, { status: 400 });
    }

    const mime = (file.type || '').toLowerCase();
    const ext = ALLOWED[mime];
    if (!ext) {
      return NextResponse.json(
        { message: 'Only PNG, WebP, JPG, or SVG logos are allowed' },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    const safeKind = kind === 'footer' ? 'footer' : 'header';
    const fileName = `${safeKind}-logo-${Date.now()}-${randomBytes(3).toString('hex')}.${ext}`;
    await writeFile(path.join(uploadsDir, fileName), buffer);

    return NextResponse.json({ url: `/uploads/${fileName}` });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Upload failed';
    return NextResponse.json({ message }, { status: 500 });
  }
}
