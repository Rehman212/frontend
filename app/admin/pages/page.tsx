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
import { cmsStore, type CmsPage } from '../lib/cms-store';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function PagesAdminPage() {
  const [pages, setPages] = useState<CmsPage[]>([]);

  const load = () => setPages(cmsStore.getPages());

  useEffect(() => {
    load();
  }, []);

  const toggleStatus = (id: string) => {
    const next = pages.map((p) =>
      p.id === id
        ? {
            ...p,
            status: p.status === 'published' ? 'draft' as const : 'published' as const,
            updatedAt: new Date().toISOString(),
          }
        : p,
    );
    setPages(next);
    cmsStore.savePages(next);
  };

  const deletePage = (id: string) => {
    if (!confirm('Delete this page? This cannot be undone.')) return;
    cmsStore.deletePage(id);
    load();
  };

  const published = pages.filter((p) => p.status === 'published').length;

  return (
    <div>
      <PageHeader
        title="Pages"
        description="Manage static pages like About, Privacy Policy, and Terms of Service."
        action={
          <PrimaryButton href="/admin/pages/new">
            <IconPlus className="w-4 h-4" />
            Add Page
          </PrimaryButton>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6 max-w-lg">
        <Card padding="p-4">
          <p className="text-2xl font-bold text-gray-900">{pages.length}</p>
          <p className="text-xs text-gray-500 mt-1">Total Pages</p>
        </Card>
        <Card padding="p-4">
          <p className="text-2xl font-bold text-gray-900">{published}</p>
          <p className="text-xs text-gray-500 mt-1">Published</p>
        </Card>
        <Card padding="p-4 col-span-2 sm:col-span-1">
          <p className="text-2xl font-bold text-gray-900">{pages.length - published}</p>
          <p className="text-xs text-gray-500 mt-1">Drafts</p>
        </Card>
      </div>

      <Card padding="p-0" className="overflow-hidden">
        {pages.length === 0 ? (
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
                          onClick={() => toggleStatus(page.id)}
                        >
                          {page.status === 'published' ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          type="button"
                          className="text-xs font-medium text-red-500 hover:text-red-600"
                          onClick={() => deletePage(page.id)}
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
