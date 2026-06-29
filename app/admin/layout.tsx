'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { APEX } from './components/ApexCharts';
import {
  IconBlog,
  IconDashboard,
  IconExternal,
  IconLogout,
  IconMenu,
  IconPages,
  IconPlus,
  IconUsers,
} from './components/AdminIcons';

const SIDEBAR_WIDE = 260;
const SIDEBAR_NARROW = 72;
const COLLAPSE_KEY = 'admin_sidebar_collapsed';

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  match?: (p: string) => boolean;
  badge?: string;
};
type NavSection = { title: string; items: NavItem[] };

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { href: '/admin', label: 'Dashboard', icon: <IconDashboard className="w-[18px] h-[18px]" /> },
    ],
  },
  {
    title: 'Content',
    items: [
      { href: '/admin/menu', label: 'Menu', icon: <IconMenu className="w-[18px] h-[18px]" /> },
      { href: '/admin/pages', label: 'Pages', icon: <IconPages className="w-[18px] h-[18px]" /> },
      {
        href: '/admin/blog',
        label: 'Blog',
        icon: <IconBlog className="w-[18px] h-[18px]" />,
        match: (p) => p.startsWith('/admin/blog'),
      },
    ],
  },
  {
    title: 'System',
    items: [
      { href: '/admin/users', label: 'Users', icon: <IconUsers className="w-[18px] h-[18px]" /> },
      // { href: '/admin/storage', label: 'Storage', icon: <IconStorage className="w-[18px] h-[18px]" /> },
    ],
  },
];

function isActive(pathname: string, item: NavItem) {
  if (item.match) return item.match(pathname);
  return pathname === item.href;
}

function pageTitle(pathname: string) {
  const map: Record<string, string> = {
    '/admin': 'Dashboard',
    '/admin/menu': 'Menu',
    '/admin/pages': 'Pages',
    '/admin/pages/new': 'Page Editor',
    '/admin/blog': 'Blog',
    '/admin/blog/new': 'New Post',
    '/admin/storage': 'Storage',
    '/admin/users': 'Users',
    '/admin/settings': 'Settings',
  };
  return map[pathname] ?? 'Admin';
}

function CollapseIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      className={`w-4 h-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ProfileDropdown({
  username,
  email,
  onLogout,
}: {
  username: string;
  email: string;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ring-2 ring-transparent hover:ring-[#2596be]/40 transition-all"
        style={{ background: '#7c3aed' }}
        aria-label="Profile menu"
        aria-expanded={open}
      >
        {username[0]?.toUpperCase() ?? '?'}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-gray-200 shadow-lg py-1 z-50"
        >
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900 truncate">{username}</p>
            <p className="text-xs text-gray-500 truncate mt-0.5">{email}</p>
          </div>
          <Link
            href="/admin/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </Link>
          <button
            type="button"
            onClick={() => { setOpen(false); onLogout(); }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <IconLogout className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [ready, setReady] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [search, setSearch] = useState('');
  const isLoginPage = pathname === '/admin/login';

  useLayoutEffect(() => {
    try {
      setCollapsed(localStorage.getItem(COLLAPSE_KEY) === '1');
    } catch { /* ignore */ }
    const mq = window.matchMedia('(min-width: 1024px)');
    setIsDesktop(mq.matches);
    const onResize = () => setIsDesktop(mq.matches);
    mq.addEventListener('change', onResize);
    setReady(true);
    return () => mq.removeEventListener('change', onResize);
  }, []);

  const toggleCollapse = () => {
    setCollapsed((v) => {
      const next = !v;
      try { localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0'); } catch { /* ignore */ }
      return next;
    });
  };

  useEffect(() => {
    if (isLoginPage) return;
    if (!loading && !user) {
      router.replace('/admin/login');
    }
  }, [loading, user, router, isLoginPage]);

  if (isLoginPage) return <>{children}</>;

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: APEX.bg }}>
        <div className="w-9 h-9 rounded-full border-2 animate-spin" style={{ borderColor: APEX.brand, borderTopColor: 'transparent' }} />
      </div>
    );
  }

  const sideW = collapsed ? SIDEBAR_NARROW : SIDEBAR_WIDE;
  const desktopOffset = isDesktop ? sideW : 0;
  const anim = ready ? 'width 300ms ease-out, margin-left 300ms ease-out' : 'none';

  return (
    <div className="min-h-screen w-full overflow-x-hidden" style={{ background: APEX.bg, color: APEX.text }}>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden bg-black/50" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar — fixed full viewport height */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 flex flex-col h-screen min-h-screen shrink-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{
          width: mobileOpen ? SIDEBAR_WIDE : sideW,
          background: APEX.sidebar,
          borderRight: `1px solid ${APEX.sidebarBorder}`,
          transition: ready ? 'width 300ms ease-out, transform 300ms ease-out' : 'none',
        }}
      >
        {/* Logo row */}
        <div className={`flex items-center gap-2.5 py-5 ${collapsed && !mobileOpen ? 'px-3 justify-center' : 'px-4'}`}>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden shrink-0"
            style={{ background: APEX.sidebarAccent }}
          >
            <Image src="/icon.png" alt="" width={20} height={20} />
          </div>
          {(!collapsed || mobileOpen) && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold leading-none truncate text-white">
                GoDocLab
              </p>
              <p className="text-[9px] font-bold tracking-[0.2em] mt-0.5" style={{ color: APEX.sidebarMuted }}>DASHBOARD</p>
            </div>
          )}
          <button type="button" className="lg:hidden shrink-0 p-1" style={{ color: APEX.sidebarMuted }} onClick={() => setMobileOpen(false)}>✕</button>
        </div>

        {/* Collapse toggle — desktop */}
        <div className={`hidden lg:flex mb-2 ${collapsed ? 'justify-center px-0' : 'px-3'}`}>
          <button
            type="button"
            onClick={toggleCollapse}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium transition-colors w-full"
            style={{ color: APEX.sidebarMuted, background: collapsed ? 'transparent' : APEX.sidebarActive }}
          >
            <CollapseIcon collapsed={collapsed} />
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="mb-4">
              {(!collapsed || mobileOpen) && (
                <p className="px-3 mb-1.5 text-[10px] font-bold tracking-widest" style={{ color: APEX.sidebarMuted }}>
                  {section.title.toUpperCase()}
                </p>
              )}
              <div className="flex flex-col gap-0.5">
                {section.items.map((item) => {
                  const active = isActive(pathname, item);
                  const showLabels = !collapsed || mobileOpen;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      title={collapsed && !mobileOpen ? item.label : undefined}
                      className={`flex items-center rounded-lg text-[13px] font-medium transition-all ${
                        showLabels ? 'gap-3 px-3 py-2.5' : 'justify-center p-2.5'
                      } ${!active ? 'hover:bg-[#1e2f4d]/60' : ''}`}
                      style={{
                        background: active ? APEX.sidebarActive : 'transparent',
                        color: active ? APEX.sidebarAccent : APEX.sidebarMuted,
                      }}
                    >
                      <span className="shrink-0" style={{ color: active ? APEX.sidebarAccent : APEX.sidebarMuted }}>{item.icon}</span>
                      {showLabels && <span className="flex-1 truncate">{item.label}</span>}
                      {showLabels && item.badge && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 text-white" style={{ background: APEX.brand }}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-2 border-t" style={{ borderColor: APEX.sidebarBorder }}>
          <div
            className={`flex items-center rounded-xl py-2 ${collapsed && !mobileOpen ? 'justify-center px-0' : 'gap-3 px-2'}`}
            style={{ background: APEX.sidebarActive }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white"
              style={{ background: '#7c3aed' }}
            >
              {user.username[0].toUpperCase()}
            </div>
            {(!collapsed || mobileOpen) && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold truncate text-white">{user.username}</p>
                <p className="text-[10px] truncate" style={{ color: APEX.sidebarMuted }}>Admin</p>
              </div>
            )}
          </div>
          {(!collapsed || mobileOpen) ? (
            <div className="mt-2 flex gap-1">
              <Link href="/" className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-medium rounded-lg transition-colors hover:text-white" style={{ color: APEX.sidebarMuted }}>
                <IconExternal className="w-3 h-3" /> Site
              </Link>
              <button
                type="button"
                onClick={() => { logout(); router.push('/admin/login'); }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-medium rounded-lg hover:text-red-400 transition-colors"
                style={{ color: APEX.sidebarMuted }}
              >
                <IconLogout className="w-3 h-3" /> Exit
              </button>
            </div>
          ) : (
            <div className="mt-2 flex flex-col gap-1">
              <Link href="/" title="View site" className="flex justify-center py-2 rounded-lg transition-colors hover:text-white" style={{ color: APEX.sidebarMuted }}>
                <IconExternal className="w-4 h-4" />
              </Link>
              <button
                type="button"
                title="Sign out"
                onClick={() => { logout(); router.push('/admin/login'); }}
                className="flex justify-center py-2 rounded-lg hover:text-red-400 transition-colors"
                style={{ color: APEX.sidebarMuted }}
              >
                <IconLogout className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main — width = viewport minus sidebar (no overflow jump) */}
      <div
        className="flex flex-col min-h-screen min-w-0 w-full"
        style={{
          marginLeft: desktopOffset,
          width: desktopOffset ? `calc(100vw - ${desktopOffset}px)` : '100%',
          transition: anim,
        }}
      >
        <header
          className="sticky top-0 z-30 flex items-center gap-3 px-4 lg:px-6 py-3 w-full bg-white border-b border-gray-200"
        >
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-lg shrink-0"
            style={{ color: APEX.muted }}
          >
            <IconMenu className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={toggleCollapse}
            className="hidden lg:flex p-2 rounded-lg shrink-0 transition-colors hover:bg-gray-100 text-gray-500"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <CollapseIcon collapsed={collapsed} />
          </button>

          <div className="flex-1 max-w-xl hidden sm:block">
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm w-full bg-gray-50"
              style={{ border: `1px solid ${APEX.border}` }}
            >
              <svg className="w-4 h-4 shrink-0" style={{ color: '#9ca3af' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="flex-1 bg-transparent outline-none text-sm min-w-0"
                style={{ color: APEX.text }}
              />
              <kbd className="hidden md:inline text-[10px] px-1.5 py-0.5 rounded shrink-0 bg-white border border-gray-200 text-gray-400">Ctrl K</kbd>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto shrink-0">
            <Link
              href="/admin/blog/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white hover:brightness-110 transition-all"
              style={{ background: `linear-gradient(135deg, ${APEX.brand}, ${APEX.brandDark})`, boxShadow: '0 2px 8px rgba(37,150,190,0.3)' }}
            >
              <IconPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Post</span>
            </Link>
            <button type="button" className="p-2 rounded-xl hidden sm:block bg-gray-50 border border-gray-200" style={{ color: APEX.muted }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              </svg>
            </button>
            <button type="button" className="p-2 rounded-xl relative hidden sm:block bg-gray-50 border border-gray-200" style={{ color: APEX.muted }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ background: APEX.brand }} />
            </button>
            <ProfileDropdown
              username={user.username}
              email={user.email}
              onLogout={() => { logout(); router.push('/admin/login'); }}
            />
          </div>
        </header>

        <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-6 overflow-y-auto">
          {pathname !== '/admin' && (
            <p className="text-xs font-semibold mb-4 tracking-wide uppercase" style={{ color: APEX.muted }}>
              {pageTitle(pathname)}
            </p>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
