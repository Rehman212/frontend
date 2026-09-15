const FALLBACK_SITE = 'https://godoclab.com';

export function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? FALLBACK_SITE).replace(/\/$/, '');
}

/** Strip leading/trailing slashes so /blog//foo becomes foo */
export function normalizeSlug(raw: string): string {
  let value = (raw || '').trim();
  try {
    value = decodeURIComponent(value);
  } catch {
    /* keep raw */
  }
  return value.replace(/^\/+|\/+$/g, '').replace(/\/{2,}/g, '/');
}

export function blogPostPath(slug: string) {
  return `/blog/${normalizeSlug(slug)}`;
}

export function blogPostUrl(slug: string) {
  return `${getSiteUrl()}${blogPostPath(slug)}`;
}
