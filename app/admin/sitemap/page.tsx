'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { TOOLS } from '../../lib/tools';
import { fetchPublishedPosts, type BlogPost } from '../lib/posts-api';
import { cmsStore } from '../lib/cms-store';
import { IconExternal, IconSitemap } from '../components/AdminIcons';
import { Badge, Card, PageHeader } from '../components/AdminUi';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://godoclab.com').replace(/\/$/, '');

type SitemapEntry = {
  path: string;
  label: string;
  group: 'Static' | 'Pages' | 'Blog' | 'Tools';
  priority: string;
};

export default function AdminSitemapPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [pages, setPages] = useState(() =>
    cmsStore
      .getPages()
      .filter((p) => p.status === 'published' && p.visibility !== 'private'),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setPages(
      cmsStore
        .getPages()
        .filter((p) => p.status === 'published' && p.visibility !== 'private'),
    );
    fetchPublishedPosts()
      .then(setPosts)
      .catch(() => setError('Could not load published blog posts.'))
      .finally(() => setLoading(false));
  }, []);

  const entries = useMemo<SitemapEntry[]>(() => {
    const staticEntries: SitemapEntry[] = [
      { path: '/', label: 'Home', group: 'Static', priority: '1.00' },
      { path: '/blog', label: 'Blog index', group: 'Static', priority: '0.90' },
      { path: '/login', label: 'Login', group: 'Static', priority: '0.50' },
      { path: '/signup', label: 'Sign Up', group: 'Static', priority: '0.50' },
    ];

    const pageEntries: SitemapEntry[] = pages.map((p) => ({
      path: `/${p.slug}`,
      label: p.title,
      group: 'Pages',
      priority: '0.60',
    }));

    const postEntries: SitemapEntry[] = posts.map((p) => ({
      path: `/blog/${p.slug}`,
      label: p.title,
      group: 'Blog',
      priority: '0.70',
    }));

    const toolEntries: SitemapEntry[] = TOOLS.map((t) => ({
      path: `/tool/${t.slug}`,
      label: t.name,
      group: 'Tools',
      priority: '0.80',
    }));

    return [...staticEntries, ...pageEntries, ...postEntries, ...toolEntries];
  }, [pages, posts]);

  const counts = useMemo(() => {
    const byGroup = { Static: 0, Pages: 0, Blog: 0, Tools: 0 };
    for (const e of entries) byGroup[e.group] += 1;
    return byGroup;
  }, [entries]);

  const xmlUrl = '/sitemap.xml';
  const fullXmlUrl = typeof window !== 'undefined' ? `${window.location.origin}/sitemap.xml` : `${SITE_URL}/sitemap.xml`;

  const copyXmlUrl = async () => {
    try {
      await navigator.clipboard.writeText(fullXmlUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const groups: SitemapEntry['group'][] = ['Static', 'Pages', 'Blog', 'Tools'];

  return (
    <div>
      <PageHeader
        title="Sitemap"
        description="Live overview of URLs included in sitemap.xml. New published posts and pages appear automatically."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={copyXmlUrl}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              {copied ? 'Copied!' : 'Copy XML URL'}
            </button>
            <a
              href={xmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:brightness-110"
              style={{
                background: 'linear-gradient(135deg, #2596be 0%, #1e7ea1 100%)',
                boxShadow: '0 2px 12px rgba(37,150,190,0.35)',
              }}
            >
              <IconExternal className="w-4 h-4" />
              Open sitemap.xml
            </a>
          </div>
        }
      />

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg text-sm bg-amber-50 text-amber-800 border border-amber-100">
          {error} Tools and pages still show below.
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Total URLs', value: loading ? '—' : entries.length },
          { label: 'Static', value: counts.Static },
          { label: 'Pages', value: counts.Pages },
          { label: 'Blog posts', value: loading ? '—' : counts.Blog },
          { label: 'Tools', value: counts.Tools },
        ].map((s) => (
          <Card key={s.label} padding="p-4">
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </Card>
        ))}
      </div>

      <Card padding="p-4" className="mb-6">
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white"
            style={{ background: 'linear-gradient(135deg, #2596be, #1e7ea1)' }}
          >
            <IconSitemap className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900">Public XML feed</p>
            <a
              href={xmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#2596be] hover:underline break-all"
            >
              {fullXmlUrl}
            </a>
            <p className="text-xs text-gray-500 mt-1.5">
              Search engines read this file. It refreshes automatically when you publish blog posts or CMS pages.
            </p>
          </div>
        </div>
      </Card>

      {loading ? (
        <Card padding="p-8">
          <p className="text-center text-sm text-gray-500">Loading sitemap entries...</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => {
            const rows = entries.filter((e) => e.group === group);
            if (rows.length === 0) return null;
            return (
              <Card key={group} padding="p-0" className="overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/80">
                  <h2 className="text-sm font-bold text-gray-900">{group}</h2>
                  <Badge>{rows.length}</Badge>
                </div>
                <ul className="divide-y divide-gray-100 max-h-[320px] overflow-y-auto">
                  {rows.map((row) => (
                    <li
                      key={row.path}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50/80 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{row.label}</p>
                        <p className="text-xs text-gray-500 truncate">{row.path}</p>
                      </div>
                      <span className="text-[11px] font-mono text-gray-400 shrink-0">
                        {row.priority}
                      </span>
                      <Link
                        href={row.path}
                        target="_blank"
                        className="text-xs font-semibold text-[#2596be] hover:underline shrink-0"
                      >
                        View
                      </Link>
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
