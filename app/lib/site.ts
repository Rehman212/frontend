const FALLBACK_SITE = 'https://godoclab.com';

/** Canonical site origin — always apex in production builds. */
export function getSiteUrl() {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL ?? FALLBACK_SITE).replace(/\/$/, '');
  if (process.env.NODE_ENV === 'production') {
    try {
      const u = new URL(raw.includes('://') ? raw : `https://${raw}`);
      if (u.hostname === 'localhost' || u.hostname === '127.0.0.1') {
        return FALLBACK_SITE;
      }
      u.hostname = u.hostname.replace(/^www\./i, '');
      u.protocol = 'https:';
      return u.origin;
    } catch {
      return FALLBACK_SITE;
    }
  }
  return raw;
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

/** Plain-text snippet for meta description (≤160 chars). */
export function htmlToMetaDescription(html: string, max = 160): string {
  const text = (html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) return '';
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}
