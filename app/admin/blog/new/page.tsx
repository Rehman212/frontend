'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import {
  Card,
  FieldLabel,
  PageHeader,
  PrimaryButton,
  SecondaryButton,
  TextArea,
  TextInput,
} from '../../components/AdminUi';
import { RichTextEditor } from '../../components/RichTextEditor';
import { SeoPanel } from '../../components/SeoPanel';
import { createPost, fetchPost, updatePost } from '../../lib/posts-api';

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function BlogPostForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');
  const { token } = useAuth();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [slugManual, setSlugManual] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(!!editId);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!editId || !token) return;
    setLoading(true);
    fetchPost(token, editId)
      .then((post) => {
        setTitle(post.title);
        setSlug(post.slug);
        setExcerpt(post.excerpt);
        setContent(post.content);
        setSeoTitle(post.seoTitle ?? '');
        setSeoDescription(post.seoDescription ?? '');
        setSeoKeywords(post.seoKeywords ?? '');
        setStatus(post.status);
        setSlugManual(true);
      })
      .catch(() => setError('Failed to load post'))
      .finally(() => setLoading(false));
  }, [editId, token]);

  useEffect(() => {
    if (!slugManual && title) setSlug(slugify(title));
  }, [title, slugManual]);

  const handleSave = async (publish: boolean) => {
    if (!title.trim() || !token) return;
    setSaving(true);
    setError('');

    const finalStatus = publish ? 'published' : status;
    const payload = {
      title,
      slug: slug || slugify(title),
      excerpt,
      content,
      seoTitle,
      seoDescription,
      seoKeywords,
      status: finalStatus as 'draft' | 'published',
    };

    try {
      if (editId) {
        await updatePost(token, editId, payload);
      } else {
        await createPost(token, payload);
      }
      setSaved(true);
      setTimeout(() => router.push('/admin/blog'), 800);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-gray-500 text-sm py-10">Loading post...</div>;
  }

  return (
    <div>
      <PageHeader
        title={editId ? 'Edit Blog Post' : 'Add Blog Post'}
        description="Write and publish articles for your website blog."
        action={
          <Link
            href="/admin/blog"
            className="text-sm font-medium text-gray-500 hover:text-[#2596be] transition-colors"
          >
            ← Back to Blog
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <div className="space-y-4">
              <div>
                <FieldLabel>Post Title</FieldLabel>
                <TextInput
                  value={title}
                  onChange={setTitle}
                  placeholder="Enter a compelling title..."
                />
              </div>
              <div>
                <FieldLabel>URL Slug</FieldLabel>
                <TextInput
                  value={slug}
                  onChange={(v) => { setSlug(v); setSlugManual(true); }}
                  placeholder="post-url-slug"
                />
                <p className="text-[11px] text-slate-600 mt-1.5">/blog/{slug || 'your-slug'}</p>
              </div>
              <div>
                <FieldLabel>Excerpt</FieldLabel>
                <TextArea
                  value={excerpt}
                  onChange={setExcerpt}
                  placeholder="Short summary shown in blog listings..."
                  rows={3}
                />
              </div>
            </div>
          </Card>

          <Card padding="p-0" className="overflow-hidden">
            <div className="px-5 pt-4">
              <FieldLabel>Content</FieldLabel>
            </div>
            <div className="mx-5 mb-5 rounded-sm overflow-hidden" style={{ border: '1px solid #c3c4c7' }}>
              <RichTextEditor value={content} onChange={setContent} />
            </div>
          </Card>

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
            pathPrefix="blog"
          />
        </div>

        <div className="space-y-4">
          <Card>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Publish</h3>
            <div className="space-y-3">
              <div>
                <FieldLabel>Status</FieldLabel>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                  className="w-full px-3.5 py-2.5 rounded-lg text-sm text-gray-900 outline-none bg-white border border-gray-200 focus:border-[#2596be] focus:ring-2 focus:ring-[#2596be]/20"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                {error && (
                  <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}
                <PrimaryButton onClick={() => handleSave(true)} disabled={saving || !title.trim() || !token}>
                  {saving ? 'Saving...' : saved ? 'Saved!' : 'Publish Post'}
                </PrimaryButton>
                <SecondaryButton onClick={() => handleSave(false)} disabled={saving || !title.trim() || !token}>
                  Save as Draft
                </SecondaryButton>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Tips</h3>
            <ul className="text-xs text-gray-500 space-y-2 leading-relaxed">
              <li>• Use a clear, descriptive title for SEO</li>
              <li>• Keep excerpt under 160 characters</li>
              <li>• Save as draft to preview before publishing</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function NewBlogPostPage() {
  return (
    <Suspense fallback={<div className="text-gray-500 text-sm py-10">Loading...</div>}>
      <BlogPostForm />
    </Suspense>
  );
}
