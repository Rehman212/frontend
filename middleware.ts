import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const host = (request.headers.get('host') || '').toLowerCase();

  // Canonical host: www → apex (indexing / duplicate URLs)
  if (host.startsWith('www.')) {
    const url = request.nextUrl.clone();
    url.hostname = host.replace(/^www\./, '');
    url.protocol = 'https:';
    url.port = '';
    return NextResponse.redirect(url, 301);
  }

  const { pathname, search } = request.nextUrl;
  if (!pathname.includes('//')) return NextResponse.next();
  const cleaned = pathname.replace(/\/{2,}/g, '/');
  if (cleaned === pathname) return NextResponse.next();
  return NextResponse.redirect(new URL(cleaned + search, request.url), 301);
}

export const config = {
  matcher: [
    /*
     * All paths except Next internals / static assets.
     * www redirect needs site-wide coverage; // cleanup still applies to /blog.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml)$).*)',
  ],
};
