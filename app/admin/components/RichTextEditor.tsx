'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MAX_FEATURED_IMAGE_BYTES, uploadFeaturedImage } from '../lib/posts-api';

function countWords(html: string) {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

export { countWords };

const BLOCK_TAGS = new Set([
  'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'li', 'div',
]);

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  /** Maximum allowed words. Omit or pass 0 for no limit. */
  maxWords?: number;
};

function getActiveBlockTag(editor: HTMLElement | null): string {
  if (!editor) return 'p';
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return 'p';

  let node: Node | null = sel.anchorNode;
  if (!node) return 'p';
  if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;

  while (node && node !== editor) {
    if (node instanceof HTMLElement) {
      const tag = node.tagName.toLowerCase();
      if (BLOCK_TAGS.has(tag)) {
        if (tag === 'div' || tag === 'li') return 'p';
        return tag;
      }
    }
    node = node.parentNode;
  }
  return 'p';
}

function getElementPath(editor: HTMLElement | null): string[] {
  if (!editor) return [];
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return [];

  let node: Node | null = sel.anchorNode;
  if (!node) return [];
  if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;

  const path: string[] = [];
  while (node && node !== editor) {
    if (node instanceof HTMLElement) {
      const tag = node.tagName.toLowerCase();
      if (tag !== 'div' || path.length === 0) path.unshift(tag);
    }
    node = node.parentNode;
  }
  return path.slice(-4);
}

function selectionInsideEditor(editor: HTMLElement | null): boolean {
  if (!editor) return false;
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return false;
  const node = sel.anchorNode;
  if (!node) return false;
  return editor.contains(node.nodeType === Node.TEXT_NODE ? node.parentNode : node);
}

/** Nearest <a> for current selection / click target. */
function getLinkFromSelection(editor: HTMLElement | null): HTMLAnchorElement | null {
  if (!editor) return null;
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  let node: Node | null = sel.anchorNode;
  if (!node) return null;
  if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;
  while (node && node !== editor) {
    if (node instanceof HTMLAnchorElement) return node;
    node = node.parentNode;
  }
  return null;
}

function normalizeLinkUrl(raw: string): string {
  const url = raw.trim();
  if (!url) return '';
  if (/^(https?:|mailto:|tel:|\/|#)/i.test(url)) return url;
  return `https://${url}`;
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Keep tables/lists/headings from ChatGPT & Word; drop junk wrappers. */
function cleanPastedHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('script, style, meta, link, xml, o\\:p').forEach((el) => el.remove());
  doc.querySelectorAll('*').forEach((el) => {
    const keepStyle = el.getAttribute('style');
    [...el.attributes].forEach((attr) => {
      const name = attr.name.toLowerCase();
      if (name === 'href' || name === 'src' || name === 'alt' || name === 'colspan' || name === 'rowspan') return;
      if (name === 'style' && keepStyle && /font-size|text-align|font-weight/i.test(keepStyle)) return;
      el.removeAttribute(attr.name);
    });
  });

  // Prefer body content; if paste is only a table fragment, keep it
  let body = doc.body.innerHTML
    .replace(/<\/?font[^>]*>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');

  // Convert non-table divs to paragraphs (do not touch table cells)
  body = body.replace(/<(div)(\b[^>]*)>([\s\S]*?)<\/div>/gi, (full, _tag, attrs, inner) => {
    if (/<(table|tr|td|th)\b/i.test(inner) || /<(table|tr|td|th)\b/i.test(full)) return full;
    return `<p${attrs || ''}>${inner}</p>`;
  });

  return body.trim() || html;
}

function looksLikeMarkdownTable(text: string): boolean {
  const lines = text.trim().split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return false;
  const pipeLines = lines.filter((l) => l.includes('|'));
  if (pipeLines.length < 2) return false;
  return pipeLines.some((l) => /^\s*\|?[\s-:|]+\|?\s*$/.test(l));
}

function markdownTableToHtml(text: string): string {
  const lines = text
    .trim()
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.includes('|'));
  if (lines.length < 2) return `<p>${escapeHtml(text)}</p>`;

  const splitRow = (line: string) =>
    line
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map((c) => c.trim());

  const isSep = (line: string) => /^\|?[\s-:|]+\|?$/.test(line);
  const header = splitRow(lines[0]);
  let start = 1;
  if (lines[1] && isSep(lines[1])) start = 2;

  let html = '<table><thead><tr>';
  header.forEach((cell) => {
    html += `<th>${escapeHtml(cell)}</th>`;
  });
  html += '</tr></thead><tbody>';
  for (let i = start; i < lines.length; i++) {
    if (isSep(lines[i])) continue;
    const cells = splitRow(lines[i]);
    html += '<tr>';
    header.forEach((_, idx) => {
      html += `<td>${escapeHtml(cells[idx] ?? '')}</td>`;
    });
    html += '</tr>';
  }
  html += '</tbody></table><p><br></p>';
  return html;
}

export function RichTextEditor({
  value,
  onChange,
  maxWords = 0,
}: RichTextEditorProps) {
  const { token } = useAuth();
  const [tab, setTab] = useState<'visual' | 'code'>('visual');
  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaError, setMediaError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [blockTag, setBlockTag] = useState('p');
  const [elementPath, setElementPath] = useState<string[]>([]);
  const [activeMarks, setActiveMarks] = useState({ bold: false, italic: false, link: false });
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkEditing, setLinkEditing] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const linkInputRef = useRef<HTMLInputElement>(null);
  const savedRange = useRef<Range | null>(null);
  const syncing = useRef(false);
  const lastValid = useRef(value);

  useEffect(() => {
    lastValid.current = value;
  }, [value]);

  useEffect(() => {
    if (tab !== 'visual' || !editorRef.current || syncing.current) return;
    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '<p><br></p>';
    }
  }, [value, tab]);

  const refreshToolbar = useCallback(() => {
    if (!selectionInsideEditor(editorRef.current)) return;
    setBlockTag(getActiveBlockTag(editorRef.current));
    setElementPath(getElementPath(editorRef.current));
    const inLink = !!getLinkFromSelection(editorRef.current);
    try {
      setActiveMarks({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        link: inLink,
      });
    } catch {
      setActiveMarks((m) => ({ ...m, link: inLink }));
    }
  }, []);

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRange.current = sel.getRangeAt(0).cloneRange();
    }
  };

  const restoreSelection = () => {
    const range = savedRange.current;
    if (!range) return;
    const sel = window.getSelection();
    if (!sel) return;
    sel.removeAllRanges();
    sel.addRange(range);
  };

  const openLinkPanel = (existing?: HTMLAnchorElement | null) => {
    setMediaOpen(false);
    editorRef.current?.focus();
    saveSelection();
    const link = existing ?? getLinkFromSelection(editorRef.current);
    setLinkEditing(!!link);
    setLinkUrl(link?.getAttribute('href') || '');
    setLinkOpen(true);
    requestAnimationFrame(() => linkInputRef.current?.focus());
  };

  const applyLink = () => {
    const url = normalizeLinkUrl(linkUrl);
    if (!url) {
      window.alert('Enter a URL');
      return;
    }
    editorRef.current?.focus();
    restoreSelection();

    const existing = getLinkFromSelection(editorRef.current);
    if (existing) {
      existing.setAttribute('href', url);
      existing.setAttribute('target', '_blank');
      existing.setAttribute('rel', 'noopener noreferrer');
    } else {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) {
        // No text selected — insert linked text
        const label = url.replace(/^https?:\/\//i, '').slice(0, 60);
        document.execCommand(
          'insertHTML',
          false,
          `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`,
        );
      } else {
        document.execCommand('createLink', false, url);
        const justLinked = getLinkFromSelection(editorRef.current);
        if (justLinked) {
          justLinked.setAttribute('target', '_blank');
          justLinked.setAttribute('rel', 'noopener noreferrer');
        }
      }
    }
    setLinkOpen(false);
    setLinkUrl('');
    syncFromVisual();
    refreshToolbar();
  };

  const removeLink = () => {
    editorRef.current?.focus();
    restoreSelection();
    document.execCommand('unlink');
    // Fallback if browser left the <a> in place
    const existing = getLinkFromSelection(editorRef.current);
    if (existing) {
      const parent = existing.parentNode;
      while (existing.firstChild) {
        parent?.insertBefore(existing.firstChild, existing);
      }
      existing.remove();
    }
    setLinkOpen(false);
    setLinkUrl('');
    syncFromVisual();
    refreshToolbar();
  };

  const onEditorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement | null;
    const anchor = target?.closest?.('a');
    if (anchor && editorRef.current?.contains(anchor)) {
      e.preventDefault();
      // Place caret inside the link so Update/Remove targets it
      const range = document.createRange();
      range.selectNodeContents(anchor);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
      openLinkPanel(anchor as HTMLAnchorElement);
      return;
    }
    refreshToolbar();
  };

  useEffect(() => {
    const onSelChange = () => refreshToolbar();
    document.addEventListener('selectionchange', onSelChange);
    return () => document.removeEventListener('selectionchange', onSelChange);
  }, [refreshToolbar]);

  const applyChange = useCallback(
    (next: string) => {
      if (maxWords > 0) {
        const nextWords = countWords(next);
        if (nextWords > maxWords) {
          const prevWords = countWords(lastValid.current);
          if (nextWords >= prevWords) {
            if (editorRef.current && tab === 'visual') {
              editorRef.current.innerHTML = lastValid.current;
            }
            return false;
          }
        }
      }
      lastValid.current = next;
      onChange(next);
      return true;
    },
    [maxWords, onChange, tab],
  );

  const syncFromVisual = useCallback(() => {
    if (!editorRef.current) return;
    syncing.current = true;
    applyChange(editorRef.current.innerHTML);
    syncing.current = false;
    refreshToolbar();
  }, [applyChange, refreshToolbar]);

  const exec = (cmd: string, val?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    syncFromVisual();
    refreshToolbar();
  };

  /** Apply paragraph / heading — works in Chrome + Firefox */
  const applyBlockFormat = (tag: string) => {
    editorRef.current?.focus();
    if (!selectionInsideEditor(editorRef.current)) {
      editorRef.current?.focus();
    }

    const formats = [`<${tag}>`, tag.toUpperCase(), tag];
    let applied = false;
    for (const fmt of formats) {
      try {
        applied = document.execCommand('formatBlock', false, fmt);
        if (applied) break;
      } catch {
        /* try next */
      }
    }

    // Fallback: manually wrap / replace nearest block
    if (!applied && editorRef.current) {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        let node: Node | null = sel.anchorNode;
        if (node?.nodeType === Node.TEXT_NODE) node = node.parentElement;
        while (node && node !== editorRef.current) {
          if (node instanceof HTMLElement && BLOCK_TAGS.has(node.tagName.toLowerCase())) {
            const next = document.createElement(tag);
            next.innerHTML = node.innerHTML;
            node.replaceWith(next);
            const range = document.createRange();
            range.selectNodeContents(next);
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);
            break;
          }
          node = node.parentNode;
        }
      }
    }

    setBlockTag(tag);
    syncFromVisual();
    refreshToolbar();
  };

  const wrapWithSpan = () => {
    editorRef.current?.focus();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (range.collapsed) {
      window.alert('Select some text first, then click Span.');
      return;
    }

    const span = document.createElement('span');
    try {
      range.surroundContents(span);
    } catch {
      const fragment = range.extractContents();
      span.appendChild(fragment);
      range.insertNode(span);
    }

    sel.removeAllRanges();
    const next = document.createRange();
    next.selectNodeContents(span);
    sel.addRange(next);
    syncFromVisual();
    refreshToolbar();
  };

  const clearInlineFormat = () => {
    editorRef.current?.focus();
    document.execCommand('removeFormat', false);
    // Also unwrap spans around selection when possible
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      let node: Node | null = sel.anchorNode;
      if (node?.nodeType === Node.TEXT_NODE) node = node.parentElement;
      if (node instanceof HTMLElement && node.tagName.toLowerCase() === 'span' && node !== editorRef.current) {
        const parent = node.parentNode;
        while (node.firstChild) parent?.insertBefore(node.firstChild, node);
        parent?.removeChild(node);
      }
    }
    syncFromVisual();
    refreshToolbar();
  };

  const insertImage = (url: string) => {
    const html = `<p><img src="${url}" alt="" style="max-width:100%;height:auto;" /></p>`;
    if (tab === 'code') {
      applyChange(value + `\n${html}\n`);
    } else {
      exec('insertHTML', html);
    }
    setMediaOpen(false);
    setMediaUrl('');
    setMediaError('');
  };

  const onPickFile = async (file: File | null) => {
    if (!file) return;
    setMediaError('');
    const name = file.name.toLowerCase();
    if (!name.endsWith('.webp') || file.type !== 'image/webp') {
      setMediaError('Only .webp images are allowed.');
      return;
    }
    if (file.size > MAX_FEATURED_IMAGE_BYTES) {
      setMediaError('Image must be 100KB or smaller.');
      return;
    }
    if (!token) {
      setMediaError('Please sign in again to upload.');
      return;
    }
    setUploading(true);
    try {
      const url = await uploadFeaturedImage(token, file);
      insertImage(url);
    } catch (e) {
      setMediaError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const applyFontSize = (size: string) => {
    editorRef.current?.focus();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    if (!size) {
      clearInlineFormat();
      return;
    }

    const range = sel.getRangeAt(0);
    if (range.collapsed) {
      window.alert('Select text first, then choose a font size.');
      return;
    }

    const span = document.createElement('span');
    span.style.fontSize = size;
    try {
      range.surroundContents(span);
    } catch {
      const fragment = range.extractContents();
      span.appendChild(fragment);
      range.insertNode(span);
    }

    sel.removeAllRanges();
    const newRange = document.createRange();
    newRange.selectNodeContents(span);
    sel.addRange(newRange);
    syncFromVisual();
    refreshToolbar();
  };

  const insertTable = (rows = 3, cols = 3) => {
    editorRef.current?.focus();
    const safeRows = Math.min(20, Math.max(2, rows));
    const safeCols = Math.min(10, Math.max(2, cols));
    let html = '<table><thead><tr>';
    for (let c = 0; c < safeCols; c++) {
      html += `<th>Header ${c + 1}</th>`;
    }
    html += '</tr></thead><tbody>';
    for (let r = 0; r < safeRows - 1; r++) {
      html += '<tr>';
      for (let c = 0; c < safeCols; c++) {
        html += '<td>Cell</td>';
      }
      html += '</tr>';
    }
    html += '</tbody></table><p><br></p>';
    document.execCommand('insertHTML', false, html);
    syncFromVisual();
  };

  const promptInsertTable = () => {
    const raw = window.prompt('Table size (rows x columns)', '3x3');
    if (!raw) return;
    const match = raw.trim().toLowerCase().match(/^(\d+)\s*[x×,\s]\s*(\d+)$/);
    if (!match) {
      window.alert('Use format like 3x3 or 4,3');
      return;
    }
    insertTable(parseInt(match[1], 10), parseInt(match[2], 10));
  };

  const onPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const html = e.clipboardData.getData('text/html');
    const text = e.clipboardData.getData('text/plain');

    if (html) {
      const cleaned = cleanPastedHtml(html);
      // ChatGPT sometimes gives weak HTML + a clean markdown table in plain text
      if (!/<table\b/i.test(cleaned) && text && looksLikeMarkdownTable(text)) {
        document.execCommand('insertHTML', false, markdownTableToHtml(text));
      } else {
        document.execCommand('insertHTML', false, cleaned);
      }
    } else if (text && looksLikeMarkdownTable(text)) {
      document.execCommand('insertHTML', false, markdownTableToHtml(text));
    } else if (text) {
      const paragraphs = text
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => `<p>${escapeHtml(line)}</p>`)
        .join('');
      document.execCommand('insertHTML', false, paragraphs || '<p><br></p>');
    }
    syncFromVisual();
  };

  const words = countWords(value);
  const overLimit = maxWords > 0 && words > maxWords;
  const atLimit = maxWords > 0 && words >= maxWords;

  return (
    <div className="rte-root" style={{ background: '#fff', color: '#1d2327' }}>
      <style>{`
        .rte-root {
          position: relative;
          display: flex;
          flex-direction: column;
          max-height: 78vh;
        }
        .rte-toolbar {
          flex-shrink: 0;
          position: sticky;
          top: 0;
          z-index: 40;
          background: #f6f7f7;
          box-shadow: 0 1px 0 #dcdcde;
        }
        .rte-body {
          flex: 1 1 auto;
          min-height: 340px;
          overflow-y: auto;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
        }
        .prose-editor h1 { font-size: 1.75rem; font-weight: 800; margin: 0.85em 0 0.4em; line-height: 1.25; color: #0f172a; }
        .prose-editor h2 { font-size: 1.4rem; font-weight: 700; margin: 0.8em 0 0.35em; line-height: 1.3; color: #0f172a; }
        .prose-editor h3 { font-size: 1.2rem; font-weight: 700; margin: 0.7em 0 0.3em; line-height: 1.35; color: #1e293b; }
        .prose-editor h4 { font-size: 1.05rem; font-weight: 700; margin: 0.65em 0 0.25em; color: #1e293b; }
        .prose-editor h5 { font-size: 0.95rem; font-weight: 700; margin: 0.55em 0 0.2em; color: #334155; }
        .prose-editor h6 { font-size: 0.85rem; font-weight: 700; margin: 0.5em 0 0.2em; color: #475569; text-transform: uppercase; letter-spacing: 0.04em; }
        .prose-editor p { margin: 0.55em 0; font-size: 14px; font-weight: 400; line-height: 1.7; color: #1d2327; }
        .prose-editor blockquote { margin: 0.75em 0; padding: 0.5em 0.9em; border-left: 3px solid #2596be; background: #f8fafc; color: #475569; }
        .prose-editor ul, .prose-editor ol { margin: 0.5em 0 0.5em 1.4em; }
        .prose-editor img { max-width: 100%; height: auto; border-radius: 8px; }
        .prose-editor a { color: #2271b1; text-decoration: underline; cursor: pointer; }
        .prose-editor span[style*="font-size"] { line-height: 1.5; }
        .prose-editor:empty:before { content: attr(data-placeholder); color: #94a3b8; pointer-events: none; }
        .prose-editor table {
          width: 100%;
          border-collapse: collapse;
          margin: 1em 0;
          font-size: 13px;
          overflow-x: auto;
          display: block;
        }
        .prose-editor thead, .prose-editor tbody, .prose-editor tr { display: table; width: 100%; table-layout: fixed; }
        .prose-editor th, .prose-editor td {
          border: 1px solid #cbd5e1;
          padding: 0.55em 0.7em;
          text-align: left;
          vertical-align: top;
        }
        .prose-editor th { background: #f1f5f9; font-weight: 700; color: #0f172a; }
      `}</style>

      <div className="rte-toolbar">
      {/* Toolbar row */}
      <div
        className="flex flex-wrap items-center justify-between gap-2 px-2 py-1.5 relative"
        style={{ borderBottom: '1px solid #dcdcde', background: '#f6f7f7' }}
      >
        <div className="relative">
          <button
            type="button"
            onClick={() => { setMediaError(''); setMediaOpen((o) => !o); }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium hover:bg-white transition-colors"
            style={{ border: '1px solid #c3c4c7', color: '#2271b1' }}
          >
            <span>🖼</span> Add Media
          </button>
          {mediaOpen && (
            <div
              className="absolute left-0 top-full mt-1 z-20 w-72 rounded-lg p-3 shadow-lg"
              style={{ background: '#fff', border: '1px solid #dcdcde' }}
            >
              <p className="text-[11px] font-semibold text-gray-700 mb-2">Insert image</p>
              <input
                ref={fileRef}
                type="file"
                accept=".webp,image/webp"
                className="hidden"
                onChange={(e) => void onPickFile(e.target.files?.[0] ?? null)}
              />
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
                className="w-full text-xs font-medium px-3 py-2 rounded mb-2"
                style={{ background: '#2271b1', color: '#fff' }}
              >
                {uploading ? 'Uploading…' : 'Upload from computer'}
              </button>
              <p className="text-[10px] text-gray-500 mb-2">.webp only, max 100KB</p>
              <p className="text-[10px] text-gray-400 mb-1">or paste image URL</p>
              <div className="flex gap-1">
                <input
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 px-2 py-1.5 rounded text-xs outline-none"
                  style={{ border: '1px solid #c3c4c7' }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const url = mediaUrl.trim();
                    if (!url) {
                      setMediaError('Enter an image URL or upload a file.');
                      return;
                    }
                    insertImage(url);
                  }}
                  className="px-2 py-1.5 rounded text-xs font-medium"
                  style={{ border: '1px solid #c3c4c7' }}
                >
                  Insert
                </button>
              </div>
              {mediaError && (
                <p className="text-[11px] text-red-600 mt-2">{mediaError}</p>
              )}
            </div>
          )}
        </div>
        <div className="flex rounded overflow-hidden" style={{ border: '1px solid #c3c4c7' }}>
          <button
            type="button"
            onClick={() => { syncFromVisual(); setTab('visual'); }}
            className="px-3 py-1 text-xs font-medium"
            style={{
              background: tab === 'visual' ? '#fff' : '#f0f0f1',
              color: tab === 'visual' ? '#1d2327' : '#646970',
            }}
          >
            Visual
          </button>
          <button
            type="button"
            onClick={() => { syncFromVisual(); setTab('code'); }}
            className="px-3 py-1 text-xs font-medium"
            style={{
              background: tab === 'code' ? '#fff' : '#f0f0f1',
              color: tab === 'code' ? '#1d2327' : '#646970',
              borderLeft: '1px solid #c3c4c7',
            }}
          >
            Code
          </button>
        </div>
      </div>

      {tab === 'visual' && (
        <div
          className="flex flex-wrap items-center gap-0.5 px-2 py-1.5"
          style={{ borderBottom: '1px solid #dcdcde', background: '#fafafa' }}
        >
          <select
            value={blockTag}
            onChange={(e) => applyBlockFormat(e.target.value)}
            className="h-7 mr-1 px-1.5 rounded text-xs max-w-[130px] font-semibold"
            style={{
              border: '1px solid #c3c4c7',
              color: '#1d2327',
              background: blockTag === 'p' ? '#fff' : '#e0f2fe',
            }}
            title="Block style — shows the tag under your cursor"
          >
            <option value="p">Paragraph &lt;p&gt;</option>
            <option value="h1">Heading 1 &lt;h1&gt;</option>
            <option value="h2">Heading 2 &lt;h2&gt;</option>
            <option value="h3">Heading 3 &lt;h3&gt;</option>
            <option value="h4">Heading 4 &lt;h4&gt;</option>
            <option value="h5">Heading 5 &lt;h5&gt;</option>
            <option value="h6">Heading 6 &lt;h6&gt;</option>
            <option value="blockquote">Quote</option>
            <option value="pre">Preformatted</option>
          </select>

          <select
            defaultValue=""
            onChange={(e) => { applyFontSize(e.target.value); e.target.value = ''; }}
            className="h-7 mr-1 px-1.5 rounded text-xs max-w-[90px]"
            style={{ border: '1px solid #c3c4c7', color: '#1d2327', background: '#fff' }}
            title="Font size (wraps selection in span)"
          >
            <option value="">Size</option>
            <option value="12px">12px</option>
            <option value="14px">14px</option>
            <option value="16px">16px</option>
            <option value="18px">18px</option>
            <option value="20px">20px</option>
            <option value="24px">24px</option>
            <option value="28px">28px</option>
            <option value="32px">32px</option>
            <option value="36px">36px</option>
            <option value="48px">48px</option>
          </select>

          <ToolbarBtn
            label="<span>"
            title="Wrap selection in <span>"
            onClick={wrapWithSpan}
          />
          <ToolbarBtn
            label="Tx"
            title="Clear formatting / unwrap span"
            onClick={clearInlineFormat}
          />

          <ToolbarSep />
          <ToolbarBtn
            label="B"
            title="Bold"
            onClick={() => exec('bold')}
            bold
            active={activeMarks.bold}
          />
          <ToolbarBtn
            label="I"
            title="Italic"
            onClick={() => exec('italic')}
            italic
            active={activeMarks.italic}
          />
          <ToolbarSep />
          <ToolbarBtn label="•" title="Bullet list" onClick={() => exec('insertUnorderedList')} />
          <ToolbarBtn label="1." title="Numbered list" onClick={() => exec('insertOrderedList')} />
          <ToolbarBtn label="❝" title="Quote" onClick={() => applyBlockFormat('blockquote')} />
          <ToolbarBtn label="▦" title="Insert table" onClick={promptInsertTable} />
          <ToolbarSep />
          <ToolbarBtn label="⫷" title="Align left" onClick={() => exec('justifyLeft')} />
          <ToolbarBtn label="≡" title="Align center" onClick={() => exec('justifyCenter')} />
          <ToolbarBtn label="⫸" title="Align right" onClick={() => exec('justifyRight')} />
          <ToolbarSep />
          <div className="relative inline-flex items-center">
            <ToolbarBtn
              label="🔗"
              title={activeMarks.link ? 'Edit / remove link' : 'Insert link'}
              onClick={() => openLinkPanel()}
              active={activeMarks.link || linkOpen}
            />
            {linkOpen && (
              <div
                className="absolute left-0 top-full mt-1 z-50 w-80 rounded-lg p-3 shadow-lg"
                style={{ background: '#fff', border: '1px solid #dcdcde' }}
                onMouseDown={(e) => e.preventDefault()}
              >
                <p className="text-[11px] font-semibold text-gray-700 mb-2">
                  {linkEditing ? 'Edit link' : 'Insert link'}
                </p>
                <input
                  ref={linkInputRef}
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      applyLink();
                    }
                    if (e.key === 'Escape') setLinkOpen(false);
                  }}
                  placeholder="https://example.com"
                  className="w-full px-2 py-1.5 rounded text-xs outline-none mb-2"
                  style={{ border: '1px solid #c3c4c7' }}
                />
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={applyLink}
                    className="px-2.5 py-1 rounded text-xs font-medium text-white"
                    style={{ background: '#2271b1' }}
                  >
                    {linkEditing ? 'Update' : 'Add link'}
                  </button>
                  {linkEditing && (
                    <button
                      type="button"
                      onClick={removeLink}
                      className="px-2.5 py-1 rounded text-xs font-medium"
                      style={{ border: '1px solid #d63638', color: '#d63638', background: '#fff' }}
                    >
                      Remove
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setLinkOpen(false)}
                    className="px-2.5 py-1 rounded text-xs font-medium text-gray-600"
                    style={{ border: '1px solid #c3c4c7' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
          <ToolbarBtn label="↩" title="Undo" onClick={() => exec('undo')} />
          <ToolbarBtn label="↪" title="Redo" onClick={() => exec('redo')} />
        </div>
      )}
      </div>

      <div className="rte-body">
      {tab === 'visual' ? (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={syncFromVisual}
          onBlur={syncFromVisual}
          onClick={onEditorClick}
          onKeyUp={refreshToolbar}
          onPaste={onPaste}
          className="min-h-[340px] px-4 py-3 outline-none text-[14px] leading-relaxed prose-editor"
          style={{ color: '#1d2327' }}
          data-placeholder="Start writing… Use the style menu for Heading / Paragraph. Paste tables from ChatGPT or use ▦ Insert table."
        />
      ) : (
        <textarea
          value={value}
          onChange={(e) => applyChange(e.target.value)}
          className="w-full min-h-[380px] px-4 py-3 outline-none font-mono text-[13px] leading-relaxed resize-y"
          style={{ color: '#1d2327', border: 'none' }}
          spellCheck={false}
        />
      )}
      </div>

      <div
        className="px-3 py-1.5 text-[11px] flex flex-wrap items-center justify-between gap-2 shrink-0"
        style={{
          borderTop: '1px solid #dcdcde',
          background: overLimit ? '#fef2f2' : '#f6f7f7',
          color: overLimit ? '#b91c1c' : '#646970',
        }}
      >
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          {tab === 'visual' && (
            <span
              className="inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded"
              style={{ background: '#e2e8f0', color: '#0f172a' }}
              title="HTML path under cursor"
            >
              {elementPath.length > 0 ? elementPath.map((t) => `<${t}>`).join(' › ') : '<p>'}
            </span>
          )}
          <span>
            Word count: {words}
            {maxWords > 0 ? ` / ${maxWords}` : ''}
            {atLimit ? ' — limit reached' : ''}
          </span>
        </div>
        {maxWords > 0 && (
          <span style={{ color: overLimit ? '#b91c1c' : '#646970' }}>
            Max {maxWords.toLocaleString()} words
          </span>
        )}
      </div>
    </div>
  );
}

function ToolbarBtn({
  label,
  title,
  onClick,
  bold,
  italic,
  active,
}: {
  label: string;
  title: string;
  onClick: () => void;
  bold?: boolean;
  italic?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="min-w-[28px] h-7 px-1.5 rounded text-sm hover:bg-white transition-colors"
      style={{
        border: active ? '1px solid #2596be' : '1px solid transparent',
        background: active ? '#e0f2fe' : 'transparent',
        fontWeight: bold ? 700 : 400,
        fontStyle: italic ? 'italic' : 'normal',
        color: '#1d2327',
      }}
    >
      {label}
    </button>
  );
}

function ToolbarSep() {
  return <span className="w-px h-5 mx-0.5" style={{ background: '#dcdcde' }} />;
}
