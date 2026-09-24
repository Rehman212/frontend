'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Badge,
  Card,
  EmptyState,
  PageHeader,
} from '../components/AdminUi';
import { CATEGORIES, TOOLS, type Tool } from '../../lib/tools';

const HIDDEN_KEY = 'admin_hidden_tools';

function loadHidden(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HIDDEN_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((s) => typeof s === 'string') : [];
  } catch {
    return [];
  }
}

function saveHidden(slugs: string[]) {
  localStorage.setItem(HIDDEN_KEY, JSON.stringify(slugs));
}

function categoryLabel(id: string) {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export default function AdminToolsPage() {
  const [hidden, setHidden] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setHidden(loadHidden());
    setReady(true);
  }, []);

  const tools = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TOOLS.filter((t) => !hidden.includes(t.slug)).filter((t) => {
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.slug.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
      );
    });
  }, [hidden, query]);

  const pdfCount = tools.filter((t) => !t.category.startsWith('img-')).length;
  const imageCount = tools.filter((t) => t.category.startsWith('img-')).length;

  const handleDelete = (tool: Tool) => {
    if (
      !confirm(
        `Hide “${tool.name}” from this admin list?\n\n(Live site still shows it until you ask for full remove next.)`,
      )
    ) {
      return;
    }
    const next = Array.from(new Set([...hidden, tool.slug]));
    saveHidden(next);
    setHidden(next);
  };

  const restoreAll = () => {
    saveHidden([]);
    setHidden([]);
  };

  return (
    <div>
      <PageHeader
        title="All Tools"
        description="Browse every PDF and image tool. Edit opens the tool editor; Delete hides it from this list for now."
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 max-w-3xl">
        <Card padding="p-4">
          <p className="text-2xl font-bold text-gray-900">{ready ? tools.length : '—'}</p>
          <p className="text-xs text-gray-500 mt-1">Visible Tools</p>
        </Card>
        <Card padding="p-4">
          <p className="text-2xl font-bold text-gray-900">{ready ? pdfCount : '—'}</p>
          <p className="text-xs text-gray-500 mt-1">PDF Tools</p>
        </Card>
        <Card padding="p-4">
          <p className="text-2xl font-bold text-gray-900">{ready ? imageCount : '—'}</p>
          <p className="text-xs text-gray-500 mt-1">Image Tools</p>
        </Card>
        <Card padding="p-4">
          <p className="text-2xl font-bold text-gray-900">{ready ? hidden.length : '—'}</p>
          <p className="text-xs text-gray-500 mt-1">Hidden</p>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tools…"
          className="flex-1 min-w-[200px] max-w-md px-3 py-2 rounded-lg text-sm outline-none border border-gray-200 focus:border-[#2596be]"
        />
        {hidden.length > 0 && (
          <button
            type="button"
            onClick={restoreAll}
            className="text-xs font-semibold px-3 py-2 rounded-lg text-[#1e7ea1] bg-[#2596be]/10 hover:bg-[#2596be]/20"
          >
            Restore hidden ({hidden.length})
          </button>
        )}
      </div>

      <Card padding="p-0" className="overflow-hidden">
        {!ready ? (
          <p className="text-sm text-gray-500 px-5 py-8 text-center">Loading tools…</p>
        ) : tools.length === 0 ? (
          <EmptyState
            title="No tools to show"
            description={
              hidden.length
                ? 'All tools are hidden. Restore them to see the list again.'
                : 'No tools match your search.'
            }
            action={
              hidden.length > 0 ? (
                <button
                  type="button"
                  onClick={restoreAll}
                  className="text-sm font-semibold px-4 py-2 rounded-lg text-white bg-[#2596be]"
                >
                  Restore all
                </button>
              ) : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {tools.map((tool) => {
                  const isImage = tool.category.startsWith('img-');
                  return (
                    <tr
                      key={tool.slug}
                      className="hover:bg-gray-50 transition-colors border-b border-gray-100"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                            style={{ background: tool.bgColor, color: tool.color }}
                          >
                            {tool.icon}
                          </span>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">{tool.name}</p>
                            <p className="text-[11px] text-gray-500 truncate max-w-xs">
                              {tool.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <code className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          /tool/{tool.slug}
                        </code>
                      </td>
                      <td className="px-5 py-4 text-gray-600 text-xs">
                        {categoryLabel(tool.category)}
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant={isImage ? 'draft' : 'success'}>
                          {isImage ? 'Image' : 'PDF'}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <a
                            href={`/tool/${tool.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-[#2596be] hover:text-[#1e7ea1]"
                          >
                            View
                          </a>
                          <Link
                            href={`/admin/tools/edit?slug=${encodeURIComponent(tool.slug)}`}
                            className="text-xs font-medium text-[#2596be] hover:text-[#1e7ea1]"
                          >
                            Edit
                          </Link>
                          <Link
                            href={`/admin/tools/editor?slug=${encodeURIComponent(tool.slug)}`}
                            className="text-xs font-medium text-[#2596be] hover:text-[#1e7ea1]"
                          >
                            Open Editor
                          </Link>
                          <button
                            type="button"
                            className="text-xs font-medium text-red-500 hover:text-red-600"
                            onClick={() => handleDelete(tool)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
