import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.godoclab.com/api';

/**
 * Proxy featured-image uploads to the Nest API (S3).
 * Local disk writes do not work on Netlify / live static hosts.
 */
export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization') || '';
    if (!auth) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const form = await req.formData();
    const res = await fetch(`${API}/admin/posts/featured-image`, {
      method: 'POST',
      headers: { Authorization: auth },
      body: form,
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Upload failed';
    return NextResponse.json({ message }, { status: 500 });
  }
}
