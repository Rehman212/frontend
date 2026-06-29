'use client';

import { useEffect, useRef, useState } from 'react';
import { IconPlus } from '../components/AdminIcons';
import {
  Badge,
  Card,
  EmptyState,
  FieldLabel,
  PageHeader,
  PrimaryButton,
  SecondaryButton,
  TextInput,
} from '../components/AdminUi';
import { cmsStore, type CmsPage, type MenuItem } from '../lib/cms-store';

function withOrder(items: MenuItem[]): MenuItem[] {
  return items.map((item, index) => ({ ...item, order: index + 1 }));
}

function sorted(items: MenuItem[]) {
  return [...items].sort((a, b) => a.order - b.order);
}

function IconGrip({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="9" cy="6" r="1.5" />
      <circle cx="15" cy="6" r="1.5" />
      <circle cx="9" cy="12" r="1.5" />
      <circle cx="15" cy="12" r="1.5" />
      <circle cx="9" cy="18" r="1.5" />
      <circle cx="15" cy="18" r="1.5" />
    </svg>
  );
}

function IconChevronUp({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
    </svg>
  );
}

function IconChevronDown({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function AddMenuDropdown({
  pages,
  items,
  onSelectPage,
  onCustomLink,
}: {
  pages: CmsPage[];
  items: MenuItem[];
  onSelectPage: (page: CmsPage) => void;
  onCustomLink: () => void;
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

  const usedPageIds = new Set(items.map((i) => i.pageId).filter(Boolean));
  const usedUrls = new Set(items.map((i) => i.url));
  const available = pages.filter(
    (p) => !usedPageIds.has(p.id) && !usedUrls.has(`/${p.slug}`),
  );

  return (
    <div ref={ref} className="relative">
      <PrimaryButton onClick={() => setOpen((v) => !v)}>
        <IconPlus className="w-4 h-4" />
        Add Menu Item
      </PrimaryButton>

      {open && (
        <div
          className="absolute right-0 mt-2 w-72 rounded-xl overflow-hidden z-50 bg-white border border-gray-200 shadow-lg"
        >
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-xs font-bold text-gray-900 uppercase tracking-wider">Add from Pages</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Select a page to add to navigation</p>
          </div>

          <div className="max-h-56 overflow-y-auto py-1">
            {available.length === 0 ? (
              <p className="px-4 py-3 text-xs text-gray-500">All pages are already in the menu.</p>
            ) : (
              available.map((page) => (
                <button
                  key={page.id}
                  type="button"
                  onClick={() => { onSelectPage(page); setOpen(false); }}
                  className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{page.title}</p>
                    <p className="text-[11px] text-gray-500 font-mono">/{page.slug}</p>
                  </div>
                  <Badge variant={page.status === 'published' ? 'success' : 'draft'}>
                    {page.status}
                  </Badge>
                </button>
              ))
            )}
          </div>

          <div className="border-t border-gray-200 py-1">
            <button
              type="button"
              onClick={() => { onCustomLink(); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#2596be] hover:bg-[#2596be]/5 transition-colors"
            >
              + Custom link (manual URL)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const [saved, setSaved] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [primaryMenuId, setPrimaryMenuId] = useState<string>('');

  useEffect(() => {
    setItems(cmsStore.getMenu());
    setPages(cmsStore.getPages());
    const settings = cmsStore.getMenuSettings();
    setPrimaryMenuId(settings.primaryMenuId ?? '');
  }, []);

  const persist = (next: MenuItem[]) => {
    const ordered = withOrder(next);
    setItems(ordered);
    cmsStore.saveMenu(ordered);
    const settings = cmsStore.getMenuSettings();
    if (settings.primaryMenuId && !ordered.some((i) => i.id === settings.primaryMenuId && i.visible)) {
      const cleared = { primaryMenuId: null };
      cmsStore.saveMenuSettings(cleared);
      setPrimaryMenuId('');
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const savePrimary = (id: string) => {
    setPrimaryMenuId(id);
    cmsStore.saveMenuSettings({ primaryMenuId: id || null });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const openCustomAdd = () => {
    setEditing({ id: '', label: '', url: '', order: items.length + 1, visible: true });
    setLabel('');
    setUrl('');
  };

  const addFromPage = (page: CmsPage) => {
    persist([
      ...items,
      {
        id: crypto.randomUUID(),
        label: page.title,
        url: `/${page.slug}`,
        order: items.length + 1,
        visible: page.status === 'published',
        pageId: page.id,
      },
    ]);
  };

  const openEdit = (item: MenuItem) => {
    setEditing(item);
    setLabel(item.label);
    setUrl(item.url);
  };

  const saveItem = () => {
    if (!label.trim() || !url.trim()) return;
    if (editing?.id) {
      persist(items.map((i) => (i.id === editing.id ? { ...i, label, url } : i)));
    } else {
      persist([
        ...items,
        { id: crypto.randomUUID(), label, url, order: items.length + 1, visible: true },
      ]);
    }
    setEditing(null);
  };

  const toggleVisible = (id: string) => {
    persist(items.map((i) => (i.id === id ? { ...i, visible: !i.visible } : i)));
  };

  const removeItem = (id: string) => {
    persist(items.filter((i) => i.id !== id));
    if (editing?.id === id) setEditing(null);
  };

  const moveItem = (id: string, direction: 'up' | 'down') => {
    const list = sorted(items);
    const idx = list.findIndex((i) => i.id === id);
    if (idx < 0) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === list.length - 1) return;
    const swap = direction === 'up' ? idx - 1 : idx + 1;
    [list[idx], list[swap]] = [list[swap], list[idx]];
    persist(list);
  };

  const handleDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) {
      setDragId(null);
      setDragOverId(null);
      return;
    }
    const list = sorted(items);
    const fromIdx = list.findIndex((i) => i.id === dragId);
    const toIdx = list.findIndex((i) => i.id === targetId);
    if (fromIdx < 0 || toIdx < 0) return;
    const next = [...list];
    const [removed] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, removed);
    persist(next);
    setDragId(null);
    setDragOverId(null);
  };

  const orderedItems = sorted(items);
  const headerItems = orderedItems.filter((i) => i.visible);

  return (
    <div>
      <PageHeader
        title="Menu"
        description="Drag items to reorder, or use arrows. Add pages from your site or create custom links."
        action={
          <div className="flex items-center gap-3">
            {saved && <span className="text-xs text-emerald-600 font-medium">Saved</span>}
            <AddMenuDropdown
              pages={pages}
              items={items}
              onSelectPage={addFromPage}
              onCustomLink={openCustomAdd}
            />
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card padding="p-0" className="overflow-hidden">
            {orderedItems.length === 0 ? (
              <EmptyState
                title="No menu items"
                description="Add pages or custom links to build your navigation."
                action={
                  <AddMenuDropdown
                    pages={pages}
                    items={items}
                    onSelectPage={addFromPage}
                    onCustomLink={openCustomAdd}
                  />
                }
              />
            ) : (
              <div>
                <div
                  className="hidden sm:grid grid-cols-[auto_auto_1fr_1fr_auto_auto] gap-2 px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 bg-gray-50"
                >
                  <span className="w-8" />
                  <span className="w-8">#</span>
                  <span>Label</span>
                  <span>URL</span>
                  <span>Status</span>
                  <span className="text-right">Actions</span>
                </div>

                <ul className="divide-y divide-gray-100">
                  {orderedItems.map((item, index) => {
                    const isDragging = dragId === item.id;
                    const isOver = dragOverId === item.id && dragId !== item.id;
                    return (
                      <li
                        key={item.id}
                        draggable
                        onDragStart={() => setDragId(item.id)}
                        onDragEnd={() => { setDragId(null); setDragOverId(null); }}
                        onDragOver={(e) => { e.preventDefault(); setDragOverId(item.id); }}
                        onDragLeave={() => setDragOverId(null)}
                        onDrop={() => handleDrop(item.id)}
                        className="grid grid-cols-1 sm:grid-cols-[auto_auto_1fr_1fr_auto_auto] gap-2 sm:gap-3 items-center px-4 py-3.5 transition-colors"
                        style={{
                          opacity: isDragging ? 0.45 : 1,
                          background: isOver ? 'rgba(37,150,190,0.08)' : 'transparent',
                          borderTop: isOver ? '2px solid #2596be' : '2px solid transparent',
                        }}
                      >
                        <button
                          type="button"
                          className="cursor-grab active:cursor-grabbing p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 touch-none"
                          title="Drag to reorder"
                          onMouseDown={(e) => e.stopPropagation()}
                        >
                          <IconGrip />
                        </button>

                        <span className="w-8 text-xs font-bold text-gray-400 tabular-nums">{index + 1}</span>

                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">{item.label}</p>
                          {item.pageId && (
                            <p className="text-[10px] text-[#2596be] mt-0.5">Linked page</p>
                          )}
                        </div>

                        <code className="text-xs text-gray-500 font-mono truncate">{item.url}</code>

                        <div>
                          <Badge variant={item.visible ? 'success' : 'draft'}>
                            {item.visible ? 'Visible' : 'Hidden'}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-end gap-1 sm:gap-2 flex-wrap">
                          <div className="flex items-center rounded-lg overflow-hidden border border-gray-200">
                            <button
                              type="button"
                              onClick={() => moveItem(item.id, 'up')}
                              disabled={index === 0}
                              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Move up"
                            >
                              <IconChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveItem(item.id, 'down')}
                              disabled={index === orderedItems.length - 1}
                              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed border-l border-gray-200"
                              title="Move down"
                            >
                              <IconChevronDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => openEdit(item)}
                            className="text-xs font-medium text-[#2596be] hover:text-[#1e7ea1] px-2 py-1"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleVisible(item.id)}
                            className="text-xs font-medium text-gray-500 hover:text-gray-700 px-2 py-1"
                          >
                            {item.visible ? 'Hide' : 'Show'}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-xs font-medium text-red-500 hover:text-red-600 px-2 py-1"
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </Card>

          {orderedItems.length > 0 && (
            <p className="text-[11px] text-gray-500 mt-3 flex items-center gap-2">
              <IconGrip className="w-3.5 h-3.5" />
              Drag the handle or use ↑ ↓ arrows to change menu sequence
            </p>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Site Header</h3>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              Visible menu items show in the site header next to the logo. Pick which link is highlighted as primary.
            </p>
            <div>
              <FieldLabel>Primary header link</FieldLabel>
              <select
                value={primaryMenuId}
                onChange={(e) => savePrimary(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg text-sm text-gray-900 outline-none bg-white border border-gray-200 focus:border-[#2596be] focus:ring-2 focus:ring-[#2596be]/20"
                disabled={headerItems.length === 0}
              >
                <option value="">None — all links equal style</option>
                {headerItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label} ({item.url})
                  </option>
                ))}
              </select>
            </div>
            {headerItems.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Header preview</p>
                <div className="flex flex-wrap gap-1.5">
                  {headerItems.map((item) => (
                    <span
                      key={item.id}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                      style={{
                        background: item.id === primaryMenuId ? 'rgba(37,150,190,0.12)' : '#f3f4f6',
                        color: item.id === primaryMenuId ? '#2596be' : '#6b7280',
                      }}
                    >
                      {item.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              {editing ? (editing.id ? 'Edit Item' : 'Custom Link') : 'Menu Editor'}
            </h3>
            {editing ? (
              <div className="space-y-4">
                <div>
                  <FieldLabel>Label</FieldLabel>
                  <TextInput value={label} onChange={setLabel} placeholder="e.g. Home" />
                </div>
                <div>
                  <FieldLabel>URL</FieldLabel>
                  <TextInput value={url} onChange={setUrl} placeholder="e.g. / or /about" />
                </div>
                <div className="flex gap-2 pt-2">
                  <PrimaryButton onClick={saveItem}>Save</PrimaryButton>
                  <SecondaryButton onClick={() => setEditing(null)}>Cancel</SecondaryButton>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 leading-relaxed">
                Click <strong className="text-gray-700">Add Menu Item</strong> to pick a page from the dropdown, or create a custom link manually.
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
