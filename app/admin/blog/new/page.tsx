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
import { RichTextEditor, countWords } from '../../components/RichTextEditor';
import { SeoPanel } from '../../components/SeoPanel';
import {
  createPost,
  fetchPost,
  updatePost,
  uploadFeaturedImage,
  MAX_FEATURED_IMAGE_BYTES,
} from '../../lib/posts-api';

const MAX_POST_WORDS = 5000;

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
  const [featuredImage, setFeaturedImage] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [slugManual, setSlugManual] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
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
        setFeaturedImage(post.featuredImage ?? '');
        setStatus(post.status);
        setSlugManual(true);
      })
      .catch(() => setError('Failed to load post'))
      .finally(() => setLoading(false));
  }, [editId, token]);

  useEffect(() => {
    if (!slugManual && title) setSlug(slugify(title));
  }, [title, slugManual]);

  const handleFeaturedImageChange = async (file: File | null) => {
    if (!file || !token) return;

    const name = file.name.toLowerCase();
    if (!name.endsWith('.webp') || file.type !== 'image/webp') {
      setError('Featured image must be a .webp file only.');
      return;
    }
    if (file.size > MAX_FEATURED_IMAGE_BYTES) {
      setError(`Featured image must be 100KB or smaller (yours is ${Math.ceil(file.size / 1024)}KB).`);
      return;
    }

    setError('');
    setUploadingImage(true);
    try {
      const url = await uploadFeaturedImage(token, file);
      setFeaturedImage(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to upload featured image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (publish: boolean) => {
    if (!title.trim() || !token) return;

    const wordCount = countWords(content);
    if (wordCount > MAX_POST_WORDS) {
      setError(`Content exceeds the ${MAX_POST_WORDS.toLocaleString()}-word limit (${wordCount.toLocaleString()} words).`);
      return;
    }

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
      featuredImage,
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

  const wordCount = countWords(content);
  const overWordLimit = wordCount > MAX_POST_WORDS;

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
              <RichTextEditor value={content} onChange={setContent} maxWords={MAX_POST_WORDS} />
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
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Featured Image</h3>
            <p className="text-[11px] text-gray-500 mb-3 leading-relaxed">
              WebP only · max 100KB. Shown on homepage Latest Articles and blog cards.
            </p>
            {featuredImage ? (
              <div className="mb-3 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={featuredImage} alt="Featured" className="w-full h-36 object-cover" />
              </div>
            ) : (
              <div className="mb-3 h-36 rounded-lg border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-xs text-gray-400">
                No image selected
              </div>
            )}
            <input
              type="file"
              accept=".webp,image/webp"
              disabled={uploadingImage || !token}
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                e.target.value = '';
                void handleFeaturedImageChange(file);
              }}
              className="block w-full text-xs text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#2596be]/10 file:text-[#1e7ea1] hover:file:bg-[#2596be]/20"
            />
            <div className="mt-2 flex items-center justify-between gap-2">
              <p className="text-[11px] text-gray-400">
                {uploadingImage ? 'Uploading…' : featuredImage ? 'Image ready' : 'Choose a .webp file'}
              </p>
              {featuredImage && (
                <button
                  type="button"
                  onClick={() => setFeaturedImage('')}
                  className="text-[11px] font-semibold text-red-600 hover:underline"
                >
                  Remove
                </button>
              )}
            </div>
          </Card>

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
                <PrimaryButton
                  onClick={() => handleSave(true)}
                  disabled={saving || uploadingImage || !title.trim() || !token || overWordLimit}
                >
                  {saving ? 'Saving...' : saved ? 'Saved!' : 'Publish Post'}
                </PrimaryButton>
                <SecondaryButton
                  onClick={() => handleSave(false)}
                  disabled={saving || uploadingImage || !title.trim() || !token || overWordLimit}
                >
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
              <li>• Featured image: .webp only, max 100KB</li>
              <li>• Content limit: max {MAX_POST_WORDS.toLocaleString()} words</li>
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
