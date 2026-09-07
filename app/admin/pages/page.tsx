'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { IconPlus } from '../components/AdminIcons';
import {
  Badge,
  Card,
  EmptyState,
  PageHeader,
  PrimaryButton,
} from '../components/AdminUi';
import { useAuth } from '../../context/AuthContext';
import { type CmsPage } from '../lib/cms-store';
import {
  deletePage,
  fetchPages,
  migrateLocalPagesIfNeeded,
  updatePage,
} from '../lib/pages-api';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function PagesAdminPage() {
  const { token } = useAuth();
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    if (!token) return;
    setError('');
    try {
      await migrateLocalPagesIfNeeded(token);
      setPages(await fetchPages(token));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load pages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const toggleStatus = async (page: CmsPage) => {
    if (!token) return;
    const status = page.status === 'published' ? 'draft' : 'published';
    const saved = await updatePage(token, page.id, {
      title: page.title,
      slug: page.slug,
      content: page.content,
      status,
      visibility: page.visibility,
      parentId: page.parentId,
      template: page.template,
      order: page.order,
      seoTitle: page.seoTitle,
      seoDescription: page.seoDescription,
      seoKeywords: page.seoKeywords,
    });
    setPages((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    if (!confirm('Delete this page? This cannot be undone.')) return;
    await deletePage(token, id);
    await load();
  };

  const published = pages.filter((p) => p.status === 'published').length;

  return (
    <div>
      <PageHeader
        title="Pages"
        description="Manage static pages like About, Privacy Policy, and Terms of Service. Pages are shared with every admin."
        action={
          <PrimaryButton href="/admin/pages/new">
            <IconPlus className="w-4 h-4" />
            Add Page
          </PrimaryButton>
        }
      />

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg text-sm bg-red-50 text-red-700 border border-red-100">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6 max-w-lg">
        <Card padding="p-4">
          <p className="text-2xl font-bold text-gray-900">{loading ? '—' : pages.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total Pages</p>
        </Card>
        <Card padding="p-4">
          <p className="text-2xl font-bold text-gray-900">{loading ? '—' : published}</p>
          <p className="text-xs text-gray-500 mt-1">Published</p>
        </Card>
        <Card padding="p-4 col-span-2 sm:col-span-1">
          <p className="text-2xl font-bold text-gray-900">{loading ? '—' : pages.length - published}</p>
          <p className="text-xs text-gray-500 mt-1">Drafts</p>
        </Card>
      </div>

      <Card padding="p-0" className="overflow-hidden">
        {loading ? (
          <p className="text-sm text-gray-500 px-5 py-8 text-center">Loading pages...</p>
        ) : pages.length === 0 ? (
          <EmptyState
            title="No pages yet"
            description="Create your first static page for the website."
            action={
              <PrimaryButton href="/admin/pages/new">
                <IconPlus className="w-4 h-4" />
                Create page
              </PrimaryButton>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Slug</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Updated</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((page) => (
                  <tr
                    key={page.id}
                    className="hover:bg-gray-50 transition-colors border-b border-gray-100"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900">{page.title}</p>
                    </td>
                    <td className="px-5 py-4">
                      <code className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">/{page.slug}</code>
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={page.status === 'published' ? 'success' : 'draft'}>
                        {page.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-gray-500 text-xs">{formatDate(page.updatedAt)}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <a
                          href={`/${page.slug}${page.status === 'draft' ? '?preview=1' : ''}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium text-[#2596be] hover:text-[#1e7ea1]"
                        >
                          View
                        </a>
                        <Link
                          href={`/admin/pages/new?id=${page.id}`}
                          className="text-xs font-medium text-[#2596be] hover:text-[#1e7ea1]"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          className="text-xs font-medium text-gray-500 hover:text-gray-700"
                          onClick={() => void toggleStatus(page)}
                        >
                          {page.status === 'published' ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          type="button"
                          className="text-xs font-medium text-red-500 hover:text-red-600"
                          onClick={() => void handleDelete(page.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
