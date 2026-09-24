import { stripHtmlText } from './blog-html';

export type TocItem = { id: string; text: string; level: 2 | 3 };

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60);
}

/** Inject stable ids on H2/H3 and return a table of contents. */
export function withHeadingAnchors(html: string): { html: string; toc: TocItem[] } {
  if (!html) return { html: '', toc: [] };

  const toc: TocItem[] = [];
  let index = 0;

  const nextHtml = html.replace(
    /<(h[23])(\b[^>]*)>([\s\S]*?)<\/\1>/gi,
    (_match, tag: string, attrs: string, inner: string) => {
      const text = stripHtmlText(inner);
      if (!text) return `<${tag}${attrs || ''}>${inner}</${tag}>`;

      index += 1;
      const base = slugify(text) || `section-${index}`;
      const id = `${base}-${index}`;
      toc.push({
        id,
        text,
        level: tag.toLowerCase() === 'h2' ? 2 : 3,
      });

      const cleanAttrs = (attrs || '').replace(/\s*id\s*=\s*(["'])[^"']*\1/i, '');
      return `<${tag}${cleanAttrs} id="${id}">${inner}</${tag}>`;
    },
  );

  return { html: nextHtml, toc };
}

export function estimateReadingMinutes(html: string) {
  const words = stripHtmlText(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}
