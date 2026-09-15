/** Article title is the page H1 — turn body H1s into H2s so Google sees one main heading. */
export function demoteContentHeadings(html: string): string {
  if (!html) return '';
  return html
    .replace(/<h1(\b[^>]*)>/gi, '<h2$1>')
    .replace(/<\/h1>/gi, '</h2>');
}
