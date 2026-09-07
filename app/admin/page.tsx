'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { cmsStore } from './lib/cms-store';
import { fetchPosts, type BlogPost } from './lib/posts-api';
import { fetchPages, migrateLocalPagesIfNeeded } from './lib/pages-api';
import {
  APEX,
  Sparkline,
} from './components/ApexCharts';
import type { CmsPage, MenuItem } from './lib/cms-store';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.godoclab.com/api';

const EMPTY_OVERVIEW = {
  totalUsers: 0,
  totalConversions: 0,
  newUsersMonth: 0,
  newUsersWeek: 0,
  newConversionsToday: 0,
  newConversionsWeek: 0,
  newConversionsMonth: 0,
};

interface Overview {
  totalUsers: number;
  totalConversions: number;
  newUsersMonth: number;
  newUsersWeek: number;
  newConversionsToday: number;
  newConversionsWeek: number;
  newConversionsMonth: number;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function StatusPill({ status }: { status: 'published' | 'draft' }) {
  const published = status === 'published';
  return (
    <span
      className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full"
      style={{
        background: published ? APEX.brandDim : 'rgba(100,116,139,0.12)',
        color: published ? APEX.brandDark : '#64748b',
      }}
    >
      {status}
    </span>
  );
}

function DashCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-xl p-5 bg-white border border-gray-200 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export default function AdminOverview() {
  const { token, user } = useAuth();
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);
  const [cmsCounts, setCmsCounts] = useState({ pages: 0, blog: 0, published: 0, publishedPosts: 0 });
  const [recentPages, setRecentPages] = useState<CmsPage[]>([]);
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [draftPages, setDraftPages] = useState<CmsPage[]>([]);
  const [draftPosts, setDraftPosts] = useState<BlogPost[]>([]);
  const [seoIssues, setSeoIssues] = useState<CmsPage[]>([]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    fetch(`${API}/admin/overview`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => {
        if (!r.ok) throw new Error('API error');
        return r.json();
      })
      .then((d) => { setData(d as Overview); setApiError(false); setLoading(false); })
      .catch(() => { setData(null); setApiError(true); setLoading(false); });
  }, [token]);

  useEffect(() => {
    if (!token) return;
    void (async () => {
      try {
        await migrateLocalPagesIfNeeded(token);
        const pages = await fetchPages(token);
        const menu = cmsStore.getMenu();
        setCmsCounts((prev) => ({
          ...prev,
          pages: pages.length,
          published: pages.filter((p) => p.status === 'published').length,
        }));
        setRecentPages([...pages].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5));
        setMenuItems([...menu].sort((a, b) => a.order - b.order));
        setDraftPages(pages.filter((p) => p.status === 'draft'));
        setSeoIssues(
          pages.filter((p) => p.status === 'published' && (!p.seoTitle.trim() || !p.seoDescription.trim())),
        );
      } catch {
        /* keep zeros */
      }
    })();
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetchPosts(token)
      .then((blog) => {
        setCmsCounts((prev) => ({
          ...prev,
          blog: blog.length,
          publishedPosts: blog.filter((p) => p.status === 'published').length,
        }));
        setRecentPosts([...blog].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5));
        setDraftPosts(blog.filter((p) => p.status === 'draft'));
      })
      .catch(() => { /* keep zeros */ });
  }, [token]);

  const overview = data ?? EMPTY_OVERVIEW;

  const statCards = [
    {
      label: 'Total Users',
      value: overview.totalUsers.toLocaleString(),
      change: `+${overview.newUsersWeek} this week`,
      pct: '+8.2%',
      up: true,
      color: APEX.brand,
      spark: [12, 18, 15, 22, 28, 25, 32, 38, 35, 42],
    },
    {
      label: 'Total Page',
      value: cmsCounts.pages.toLocaleString(),
      change: `${cmsCounts.published} published`,
      pct: cmsCounts.published > 0 ? 'Live' : 'Draft',
      up: cmsCounts.published > 0,
      color: '#1e7ea1',
      spark: [2, 3, 3, 4, 4, 4, 5, 5, cmsCounts.pages || 1, cmsCounts.pages || 1],
    },
    {
      label: 'Total Post',
      value: cmsCounts.blog.toLocaleString(),
      change: `${cmsCounts.publishedPosts} published`,
      pct: cmsCounts.publishedPosts > 0 ? 'Live' : 'Draft',
      up: cmsCounts.publishedPosts > 0,
      color: APEX.sidebarAccent,
      spark: [0, 1, 1, 2, 2, 2, 3, 3, cmsCounts.blog || 1, cmsCounts.blog || 1],
    },
  ];

  const pendingCount = draftPages.length + draftPosts.length;

  return (
    <div className="space-y-6 w-full">
      {/* Welcome banner */}
      <div
        className="relative rounded-xl overflow-hidden px-6 py-7 sm:px-8"
        style={{ background: APEX.heroGradient }}
      >
        <div
          className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-15 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #fff, transparent)', transform: 'translate(25%,-45%)' }}
        />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-sky-200/70 mb-2">CMS Admin</p>
            <h1 className="text-2xl sm:text-[28px] font-bold text-white tracking-tight">Dashboard</h1>
            <p className="text-sm mt-1.5 text-sky-100/75">
              Welcome back, <span className="font-semibold text-white">{user?.username}</span>
            </p>
          </div>
          <div className="flex gap-8">
            {[
              { v: String(cmsCounts.pages), l: 'Pages' },
              { v: String(cmsCounts.blog), l: 'Blog Posts' },
            ].map((s) => (
              <div key={s.l} className="text-center">
                <p className="text-xl font-bold text-white tabular-nums">{s.v}</p>
                <p className="text-[10px] text-sky-200/60 uppercase tracking-wide mt-0.5">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {apiError && (
        <div className="px-4 py-3 rounded-lg text-sm bg-amber-50 text-amber-800 border border-amber-200">
          Live stats unavailable — make sure the API is running. CMS data below is still available.
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((s) => (
          <DashCard key={s.label} className="relative overflow-hidden">
            {loading && s.label === 'Total Users' ? (
              <div className="h-[88px] animate-pulse bg-gray-100 rounded-lg" />
            ) : (
              <>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-medium text-gray-500">{s.label}</p>
                    <p className="text-2xl font-bold mt-1 tabular-nums text-gray-900">{s.value}</p>
                    <p className="text-[11px] mt-1 text-gray-400">{s.change}</p>
                  </div>
                  <span
                    className="text-[11px] font-semibold px-1.5 py-0.5 rounded"
                    style={{
                      color: s.up ? APEX.brandDark : '#dc2626',
                      background: s.up ? APEX.brandDim : 'rgba(220,38,38,0.08)',
                    }}
                  >
                    {s.pct}
                  </span>
                </div>
                <div className="mt-3 flex justify-end">
                  <Sparkline data={s.spark} color={s.color} width={110} height={36} />
                </div>
              </>
            )}
          </DashCard>
        ))}
      </div>

      {/* Recent content + platform stats */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <DashCard className="xl:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">Recent Pages</h2>
              <p className="text-xs text-gray-500 mt-0.5">Latest updated pages</p>
            </div>
            <Link href="/admin/pages" className="text-xs font-semibold text-[#2596be] hover:underline">
              View all
            </Link>
          </div>
          {recentPages.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">No pages yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {recentPages.map((page) => (
                <li key={page.id} className="py-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{page.title}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">/{page.slug} · {formatDate(page.updatedAt)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusPill status={page.status} />
                    <Link href={`/admin/pages/new?id=${page.id}`} className="text-[11px] font-medium text-[#2596be] hover:underline">
                      Edit
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/admin/pages/new"
            className="mt-4 block w-full text-center py-2.5 rounded-lg text-xs font-semibold text-white"
            style={{ background: `linear-gradient(135deg, ${APEX.brand}, ${APEX.brandDark})` }}
          >
            + Add New Page
          </Link>
        </DashCard>

        <DashCard className="xl:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">Recent Posts</h2>
              <p className="text-xs text-gray-500 mt-0.5">Latest blog articles</p>
            </div>
            <Link href="/admin/blog" className="text-xs font-semibold text-[#2596be] hover:underline">
              View all
            </Link>
          </div>
          {recentPosts.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">No blog posts yet.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {recentPosts.map((post) => (
                <li key={post.id} className="py-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{post.title}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{post.author} · {formatDate(post.updatedAt)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusPill status={post.status} />
                    {post.status === 'published' && (
                      <a
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-medium text-gray-500 hover:text-[#2596be]"
                      >
                        View
                      </a>
                    )}
                    <Link href={`/admin/blog/new?id=${post.id}`} className="text-[11px] font-medium text-[#2596be] hover:underline">
                      Edit
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/admin/blog/new"
            className="mt-4 block w-full text-center py-2.5 rounded-lg text-xs font-semibold text-white"
            style={{ background: `linear-gradient(135deg, ${APEX.brand}, ${APEX.brandDark})` }}
          >
            + Add New Post
          </Link>
        </DashCard>

        <DashCard className="xl:col-span-1 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">Site Menu</h2>
              <p className="text-xs text-gray-500 mt-0.5">Live navigation on your site</p>
            </div>
            <Link href="/admin/menu" className="text-xs font-semibold text-[#2596be] hover:underline">
              Edit menu
            </Link>
          </div>

          {menuItems.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No menu items yet.</p>
          ) : (
            <ul className="space-y-2 mb-5">
              {menuItems.map((item, i) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-gray-100 bg-gray-50/60"
                >
                  <span
                    className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 text-white"
                    style={{ background: APEX.brand }}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.label}</p>
                    <p className="text-[10px] text-gray-400 font-mono truncate">{item.url}</p>
                  </div>
                  <span
                    className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded shrink-0"
                    style={{
                      background: item.visible ? APEX.brandDim : 'rgba(100,116,139,0.12)',
                      color: item.visible ? APEX.brandDark : '#94a3b8',
                    }}
                  >
                    {item.visible ? 'Live' : 'Hidden'}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <div className="border-t border-gray-100 pt-4 mt-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-900">Action Items</h3>
              {pendingCount > 0 && (
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                  style={{ background: '#f59e0b' }}
                >
                  {pendingCount} pending
                </span>
              )}
            </div>

            {pendingCount === 0 && seoIssues.length === 0 ? (
              <p className="text-xs text-gray-400 py-2">All caught up — nothing pending.</p>
            ) : (
              <ul className="space-y-2 max-h-[140px] overflow-y-auto">
                {draftPages.map((page) => (
                  <li key={page.id} className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-gray-600 truncate">
                      <span className="font-medium text-gray-800">Page:</span> {page.title}
                    </span>
                    <Link href={`/admin/pages/new?id=${page.id}`} className="shrink-0 font-semibold text-[#2596be] hover:underline">
                      Publish →
                    </Link>
                  </li>
                ))}
                {draftPosts.map((post) => (
                  <li key={post.id} className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-gray-600 truncate">
                      <span className="font-medium text-gray-800">Post:</span> {post.title}
                    </span>
                    <Link href={`/admin/blog/new?id=${post.id}`} className="shrink-0 font-semibold text-[#2596be] hover:underline">
                      Publish →
                    </Link>
                  </li>
                ))}
                {seoIssues.slice(0, 3).map((page) => (
                  <li key={`seo-${page.id}`} className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-gray-600 truncate">
                      <span className="font-medium text-amber-600">SEO:</span> {page.title}
                    </span>
                    <Link href={`/admin/pages/new?id=${page.id}`} className="shrink-0 font-semibold text-[#2596be] hover:underline">
                      Fix →
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Link
            href="/"
            target="_blank"
            className="mt-4 block w-full text-center py-2.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 hover:border-[#2596be]/40 hover:text-[#2596be] transition-colors"
          >
            View Live Site ↗
          </Link>
        </DashCard>
      </div>

      {/* CMS shortcuts */}
      <div>
        <div
          className="rounded-lg px-4 py-2 mb-3 text-sm font-bold text-white inline-block"
          style={{ background: APEX.brand }}
        >
          Content Management
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { href: '/admin/menu', label: 'Menu', sub: 'Navigation', count: null, highlight: false },
            { href: '/admin/pages', label: 'Pages', sub: `${cmsCounts.pages} total`, count: cmsCounts.published, highlight: false },
            { href: '/admin/blog', label: 'Blog', sub: `${cmsCounts.blog} posts`, count: null, highlight: false },
            { href: '/admin/blog/new', label: 'New Post', sub: 'Write article', highlight: true },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md border group bg-white"
              style={{
                borderColor: item.highlight ? APEX.brand : '#e5e7eb',
                background: item.highlight ? APEX.brandDim : '#ffffff',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="w-2 h-2 rounded-full" style={{ background: item.highlight ? APEX.brand : '#cbd5e1' }} />
                {item.count != null && (
                  <span className="text-[10px] font-bold" style={{ color: APEX.brand }}>{item.count} live</span>
                )}
              </div>
              <p className="text-sm font-semibold text-gray-900 group-hover:text-[#2596be] transition-colors">
                {item.label}
              </p>
              <p className="text-[11px] mt-0.5 text-gray-500">{item.sub}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* System quick links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { href: '/admin/users', title: 'Users', sub: data ? `${data.totalUsers.toLocaleString()} registered` : 'Manage accounts' },
          { href: '/admin/menu', title: 'Menu', sub: 'Edit site navigation' },
          { href: '/admin/settings', title: 'Settings', sub: 'Account & preferences' },
        ].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center justify-between p-4 rounded-xl bg-white border border-gray-200 hover:shadow-md hover:border-[#2596be]/40 transition-all group"
          >
            <div>
              <p className="text-sm font-semibold text-gray-900 group-hover:text-[#2596be] transition-colors">{link.title}</p>
              <p className="text-xs mt-0.5 text-gray-500">{link.sub}</p>
            </div>
            <span className="text-gray-300 group-hover:text-[#2596be] transition-colors text-lg">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
