import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { randomBytes } from 'crypto';

export const runtime = 'nodejs';

const MAX_BYTES = 100 * 1024; // 100KB
const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.godoclab.com/api';

function isWebp(buffer: Buffer, fileName: string, mime: string) {
  const nameOk = fileName.toLowerCase().endsWith('.webp');
  const mimeOk = mime.toLowerCase() === 'image/webp';
  const magicOk =
    buffer.length >= 12 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP';
  return nameOk && mimeOk && magicOk;
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

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const ok = await assertAdmin(token);
    if (!ok) {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ message: 'Image file is required' }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { message: 'Featured image must be 100KB or smaller' },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (!isWebp(buffer, file.name, file.type || '')) {
      return NextResponse.json({ message: 'Only .webp images are allowed' }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    const fileName = `blog-${Date.now()}-${randomBytes(4).toString('hex')}.webp`;
    await writeFile(path.join(uploadsDir, fileName), buffer);

    return NextResponse.json({ url: `/uploads/${fileName}` });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Upload failed';
    return NextResponse.json({ message }, { status: 500 });
  }
}
