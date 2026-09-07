'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { MetaBox } from '../../components/MetaBox';
import { RichTextEditor } from '../../components/RichTextEditor';
import { SeoPanel } from '../../components/SeoPanel';
import { type CmsPage } from '../../lib/cms-store';
import { useAuth } from '../../../context/AuthContext';
import {
  createPage,
  fetchPage,
  fetchPages,
  migrateLocalPagesIfNeeded,
  updatePage,
} from '../../lib/pages-api';

const TEMPLATES = [
  { value: 'default', label: 'Default template' },
  { value: 'full-width', label: 'Full Width' },
  { value: 'landing', label: 'Landing Page' },
  { value: 'blank', label: 'Blank (no header)' },
];

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function PageEditorForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');

  const { token } = useAuth();
  const [allPages, setAllPages] = useState<CmsPage[]>([]);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [parentId, setParentId] = useState<string | null>(null);
  const [template, setTemplate] = useState('default');
  const [order, setOrder] = useState(0);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [slugManual, setSlugManual] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showStatusEdit, setShowStatusEdit] = useState(false);
  const [showVisibilityEdit, setShowVisibilityEdit] = useState(false);

  useEffect(() => {
    if (!token) return;
    void (async () => {
      try {
        await migrateLocalPagesIfNeeded(token);
        const pages = await fetchPages(token);
        setAllPages(pages);
        if (!editId) return;
        const page = pages.find((p) => p.id === editId) ?? (await fetchPage(token, editId));
        setTitle(page.title);
        setSlug(page.slug);
        setContent(page.content ?? '');
        setStatus(page.status);
        setVisibility(page.visibility ?? 'public');
        setParentId(page.parentId ?? null);
        setTemplate(page.template ?? 'default');
        setOrder(page.order ?? 0);
        setSeoTitle(page.seoTitle ?? '');
        setSeoDescription(page.seoDescription ?? '');
        setSeoKeywords(page.seoKeywords ?? '');
        setSlugManual(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load page');
      }
    })();
  }, [editId, token]);

  useEffect(() => {
    if (!slugManual && title) setSlug(slugify(title));
  }, [title, slugManual]);

  const finalSlug = slug.trim() || slugify(title) || 'untitled';

  const buildPageData = (publish: boolean) => ({
    title: title.trim(),
    slug: finalSlug,
    content,
    status: (publish ? 'published' : status) as 'draft' | 'published',
    visibility,
    parentId: parentId || null,
    template,
    order,
    seoTitle,
    seoDescription,
    seoKeywords,
  });

  const handleSave = async (publish: boolean, stay = false) => {
    if (!title.trim()) {
      setError('Please add a title before saving.');
      return;
    }
    if (!token) {
      setError('Please sign in again.');
      return;
    }

    const duplicate = allPages.find((p) => p.slug === finalSlug && p.id !== editId);
    if (duplicate) {
      setError('This slug is already used by another page.');
      return;
    }

    setError('');
    setSaving(true);
    const data = buildPageData(publish);

    try {
      if (editId) {
        await updatePage(token, editId, data);
      } else {
        await createPage(token, data);
      }
      if (publish) setStatus('published');
      if (!stay) setTimeout(() => router.push('/admin/pages'), 500);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save page');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    if (!title.trim()) {
      setError('Add a title to preview.');
      return;
    }
    window.open(`/${finalSlug}${status === 'draft' ? '?preview=1' : ''}`, '_blank');
  };

  const parentOptions = allPages.filter((p) => p.id !== editId);

  const selectCls =
    'w-full px-2 py-1.5 rounded text-[13px] outline-none';
  const selectStyle = { background: '#fff', border: '1px solid #8c8f94', color: '#1d2327' };
  const labelCls = 'block text-xs font-medium text-[#646970] mb-1';
  const linkBtn = 'text-[#2271b1] hover:underline text-xs ml-1';

  return (
    <div className="-mx-2 sm:-mx-0">
      {/* WP-style top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h1 className="text-xl font-normal text-gray-900">
          {editId ? 'Edit Page' : 'Add New Page'}
        </h1>
        <Link
          href="/admin/pages"
          className="text-sm text-gray-500 hover:text-[#2596be] transition-colors"
        >
          ← All Pages
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-5 items-start">
        {/* ── MAIN COLUMN ── */}
        <div className="space-y-0">
          {/* Title input — WordPress style */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add title"
            className="w-full px-3 py-3 text-2xl font-normal outline-none mb-3 rounded-sm"
            style={{
              background: '#fff',
              border: '1px solid #c3c4c7',
              color: '#1d2327',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.07)',
            }}
          />

          {/* Editor container */}
          <div className="rounded-sm overflow-hidden mb-4" style={{ border: '1px solid #c3c4c7' }}>
            <RichTextEditor value={content} onChange={setContent} />
          </div>

          {/* Rank Math style SEO */}
          <SeoPanel
            slug={slug}
            pageTitle={title}
            seoTitle={seoTitle}
            seoDescription={seoDescription}
            seoKeywords={seoKeywords}
            onSeoTitleChange={setSeoTitle}
            onSeoDescriptionChange={setSeoDescription}
            onSeoKeywordsChange={setSeoKeywords}
            onSlugChange={(v) => { setSlug(v); setSlugManual(true); }}
          />
        </div>

        {/* ── SIDEBAR ── */}
        <div className="space-y-3 xl:sticky xl:top-4">
          {/* Publish */}
          <MetaBox title="Publish">
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 pb-3" style={{ borderBottom: '1px solid #dcdcde' }}>
                <button
                  type="button"
                  onClick={() => handleSave(false, true)}
                  disabled={saving}
                  className="px-3 py-1.5 rounded text-xs font-medium hover:opacity-90 disabled:opacity-50"
                  style={{ background: '#f6f7f7', border: '1px solid #c3c4c7', color: '#2271b1' }}
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={handlePreview}
                  className="px-3 py-1.5 rounded text-xs font-medium"
                  style={{ background: '#f6f7f7', border: '1px solid #c3c4c7', color: '#2271b1' }}
                >
                  Preview
                </button>
              </div>

              <ul className="space-y-2 text-[13px]">
                <li className="flex items-start justify-between gap-2">
                  <span>
                    <span className="text-[#646970]">Status: </span>
                    <strong className="capitalize">{status}</strong>
                    {!showStatusEdit && (
                      <button type="button" className={linkBtn} onClick={() => setShowStatusEdit(true)}>Edit</button>
                    )}
                  </span>
                </li>
                {showStatusEdit && (
                  <li>
                    <select
                      value={status}
                      onChange={(e) => { setStatus(e.target.value as 'draft' | 'published'); setShowStatusEdit(false); }}
                      className={selectCls}
                      style={selectStyle}
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </li>
                )}

                <li>
                  <span className="text-[#646970]">Visibility: </span>
                  <strong className="capitalize">{visibility}</strong>
                  {!showVisibilityEdit && (
                    <button type="button" className={linkBtn} onClick={() => setShowVisibilityEdit(true)}>Edit</button>
                  )}
                </li>
                {showVisibilityEdit && (
                  <li>
                    <select
                      value={visibility}
                      onChange={(e) => { setVisibility(e.target.value as 'public' | 'private'); setShowVisibilityEdit(false); }}
                      className={selectCls}
                      style={selectStyle}
                    >
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                    </select>
                  </li>
                )}

                <li>
                  <span className="text-[#646970]">Publish: </span>
                  <strong>Immediately</strong>
                </li>
              </ul>

              {error && <p className="text-xs text-red-600">{error}</p>}

              <div className="flex justify-end pt-2" style={{ borderTop: '1px solid #dcdcde' }}>
                <button
                  type="button"
                  onClick={() => handleSave(true)}
                  disabled={saving || !title.trim()}
                  className="px-4 py-1.5 rounded text-[13px] font-semibold text-white disabled:opacity-50"
                  style={{ background: '#2271b1', border: '1px solid #135e96' }}
                >
                  {saving ? 'Publishing...' : 'Publish'}
                </button>
              </div>
            </div>
          </MetaBox>

          {/* Page Attributes */}
          <MetaBox title="Page Attributes">
            <div className="space-y-3">
              <div>
                <label className={labelCls}>Parent</label>
                <select
                  value={parentId ?? ''}
                  onChange={(e) => setParentId(e.target.value || null)}
                  className={selectCls}
                  style={selectStyle}
                >
                  <option value="">(no parent)</option>
                  {parentOptions.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Template</label>
                <select
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  className={selectCls}
                  style={selectStyle}
                >
                  {TEMPLATES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Order</label>
                <input
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value) || 0)}
                  className={selectCls}
                  style={selectStyle}
                  min={0}
                />
              </div>
            </div>
          </MetaBox>
        </div>
      </div>
    </div>
  );
}

export default function NewPageEditor() {
  return (
    <Suspense fallback={<div className="text-slate-500 text-sm py-10">Loading editor...</div>}>
      <PageEditorForm />
    </Suspense>
  );
}
