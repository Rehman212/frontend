import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (!pathname.includes('//')) return NextResponse.next();
  const cleaned = pathname.replace(/\/{2,}/g, '/');
  if (cleaned === pathname) return NextResponse.next();
  return NextResponse.redirect(new URL(cleaned + search, request.url), 301);
}

export const config = {
  matcher: ['/blog/:path*'],
};
