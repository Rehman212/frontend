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

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  /** Maximum allowed words. Omit or pass 0 for no limit. */
  maxWords?: number;
};

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
  const editorRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const syncing = useRef(false);
  const lastValid = useRef(value);

  useEffect(() => {
    lastValid.current = value;
  }, [value]);

  useEffect(() => {
    if (tab !== 'visual' || !editorRef.current || syncing.current) return;
    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value, tab]);

  const applyChange = useCallback(
    (next: string) => {
      if (maxWords > 0) {
        const nextWords = countWords(next);
        if (nextWords > maxWords) {
          const prevWords = countWords(lastValid.current);
          // Block growth past the limit; still allow shrinking an over-limit draft
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
  }, [applyChange]);

  const exec = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    editorRef.current?.focus();
    syncFromVisual();
  };

  const insertImage = (url: string) => {
    const html = `<img src="${url}" alt="" style="max-width:100%;height:auto;" />`;
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
      document.execCommand('removeFormat', false);
      syncFromVisual();
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
  };

  const words = countWords(value);
  const overLimit = maxWords > 0 && words > maxWords;
  const atLimit = maxWords > 0 && words >= maxWords;

  return (
    <div style={{ background: '#fff', color: '#1d2327' }}>
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
            defaultValue="p"
            onChange={(e) => { exec('formatBlock', e.target.value); e.target.value = 'p'; }}
            className="h-7 mr-1 px-1.5 rounded text-xs max-w-[110px]"
            style={{ border: '1px solid #c3c4c7', color: '#1d2327', background: '#fff' }}
            title="Paragraph style"
          >
            <option value="p">Paragraph</option>
            <option value="h1">Heading 1</option>
            <option value="h2">Heading 2</option>
            <option value="h3">Heading 3</option>
            <option value="h4">Heading 4</option>
          </select>
          <select
            defaultValue=""
            onChange={(e) => { applyFontSize(e.target.value); e.target.value = ''; }}
            className="h-7 mr-1 px-1.5 rounded text-xs max-w-[90px]"
            style={{ border: '1px solid #c3c4c7', color: '#1d2327', background: '#fff' }}
            title="Font size"
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
          <ToolbarSep />
          <ToolbarBtn label="B" title="Bold" onClick={() => exec('bold')} bold />
          <ToolbarBtn label="I" title="Italic" onClick={() => exec('italic')} italic />
          <ToolbarSep />
          <ToolbarBtn label="•" title="Bullet list" onClick={() => exec('insertUnorderedList')} />
          <ToolbarBtn label="1." title="Numbered list" onClick={() => exec('insertOrderedList')} />
          <ToolbarBtn label="❝" title="Quote" onClick={() => exec('formatBlock', 'blockquote')} />
          <ToolbarSep />
          <ToolbarBtn label="⫷" title="Align left" onClick={() => exec('justifyLeft')} />
          <ToolbarBtn label="≡" title="Align center" onClick={() => exec('justifyCenter')} />
          <ToolbarBtn label="⫸" title="Align right" onClick={() => exec('justifyRight')} />
          <ToolbarSep />
          <ToolbarBtn
            label="🔗"
            title="Insert link"
            onClick={() => {
              const url = window.prompt('Link URL:');
              if (url) exec('createLink', url);
            }}
          />
          <ToolbarBtn label="↩" title="Undo" onClick={() => exec('undo')} />
          <ToolbarBtn label="↪" title="Redo" onClick={() => exec('redo')} />
        </div>
      )}

      {tab === 'visual' ? (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={syncFromVisual}
          onBlur={syncFromVisual}
          className="min-h-[340px] px-4 py-3 outline-none text-[14px] leading-relaxed prose-editor"
          style={{ color: '#1d2327' }}
          data-placeholder="Start writing or type / to choose a block"
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

      <div
        className="px-3 py-1.5 text-[11px] flex items-center justify-between gap-2"
        style={{
          borderTop: '1px solid #dcdcde',
          background: overLimit ? '#fef2f2' : '#f6f7f7',
          color: overLimit ? '#b91c1c' : '#646970',
        }}
      >
        <span>
          Word count: {words}
          {maxWords > 0 ? ` / ${maxWords}` : ''}
          {atLimit ? ' — limit reached' : ''}
        </span>
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
}: {
  label: string;
  title: string;
  onClick: () => void;
  bold?: boolean;
  italic?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="min-w-[28px] h-7 px-1.5 rounded text-sm hover:bg-white transition-colors"
      style={{
        border: '1px solid transparent',
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
