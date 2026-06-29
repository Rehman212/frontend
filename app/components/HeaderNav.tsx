'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cmsStore, type MenuItem } from '../admin/lib/cms-store';

function isMenuItemActive(itemUrl: string, pathname: string, hash: string): boolean {
  if (itemUrl.startsWith('http://') || itemUrl.startsWith('https://')) {
    return false;
  }

  const [pathPart, hashPart] = itemUrl.split('#');
  const normalizedPath = pathPart || '/';

  if (hashPart) {
    const pathMatch =
      normalizedPath === '/'
        ? pathname === '/'
        : pathname === normalizedPath || pathname.startsWith(`${normalizedPath}/`);
    const hashMatch = hash === `#${hashPart}` || hash === hashPart;
    return pathMatch && hashMatch;
  }

  if (normalizedPath === '/') {
    return pathname === '/';
  }

  return pathname === normalizedPath || pathname.startsWith(`${normalizedPath}/`);
}

function linkClassName(isActive: boolean, isPrimary: boolean) {
  if (isActive) {
    return 'px-3 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap text-[#2596be] bg-[#2596be]/15 ring-1 ring-[#2596be]/30';
  }
  if (isPrimary) {
    return 'px-3 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap text-[#2596be] bg-[#2596be]/10';
  }
  return 'px-3 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap text-gray-600 hover:text-[#2596be] hover:bg-gray-50';
}

function NavLink({
  item,
  isPrimary,
  isActive,
}: {
  item: MenuItem;
  isPrimary: boolean;
  isActive: boolean;
}) {
  const className = linkClassName(isActive, isPrimary);

  if (item.url.startsWith('http://') || item.url.startsWith('https://')) {
    return (
      <a href={item.url} className={className} target="_blank" rel="noopener noreferrer">
        {item.label}
      </a>
    );
  }

  return (
    <Link href={item.url} className={className} aria-current={isActive ? 'page' : undefined}>
      {item.label}
    </Link>
  );
}

export function HeaderNav() {
  const pathname = usePathname();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [primaryId, setPrimaryId] = useState<string | null>(null);
  const [hash, setHash] = useState('');

  useEffect(() => {
    const load = () => {
      const menu = cmsStore.getMenu();
      const settings = cmsStore.getMenuSettings();
      const visible = [...menu]
        .filter((item) => item.visible)
        .sort((a, b) => a.order - b.order);
      setItems(visible);
      const primary =
        settings.primaryMenuId && visible.some((i) => i.id === settings.primaryMenuId)
          ? settings.primaryMenuId
          : null;
      setPrimaryId(primary);
    };

    load();
    window.addEventListener('cms-menu-updated', load);
    window.addEventListener('storage', load);
    return () => {
      window.removeEventListener('cms-menu-updated', load);
      window.removeEventListener('storage', load);
    };
  }, []);

  useEffect(() => {
    const syncHash = () => setHash(window.location.hash);
    syncHash();
    window.addEventListener('hashchange', syncHash);
    return () => window.removeEventListener('hashchange', syncHash);
  }, [pathname]);

  if (items.length === 0) return null;

  return (
    <nav className="hidden lg:flex items-center gap-0.5 shrink-0">
      {items.map((item) => (
        <NavLink
          key={item.id}
          item={item}
          isPrimary={item.id === primaryId}
          isActive={isMenuItemActive(item.url, pathname, hash)}
        />
      ))}
    </nav>
  );
}
