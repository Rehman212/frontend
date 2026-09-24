'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Card,
  FieldLabel,
  PageHeader,
  PrimaryButton,
  TextInput,
  TextArea,
} from '../../components/AdminUi';
import { CATEGORIES, TOOLS } from '../../../lib/tools';
import { useAuth } from '../../../context/AuthContext';
import { fetchAdminToolPage } from '../../lib/tool-pages-api';

function EditToolForm() {
  const { token } = useAuth();
  const searchParams = useSearchParams();
  const slug = (searchParams.get('slug') || '').trim();

  const tool = useMemo(() => TOOLS.find((t) => t.slug === slug) ?? null, [slug]);
  const category = tool
    ? CATEGORIES.find((c) => c.id === tool.category)?.label ?? tool.category
    : '';
  const [hasContent, setHasContent] = useState(false);

  useEffect(() => {
    if (!token || !slug) return;
    fetchAdminToolPage(token, slug)
      .then((p) => setHasContent(!!p.content?.trim()))
      .catch(() => setHasContent(false));
  }, [token, slug]);

  if (!slug || !tool) {
    return (
      <div>
        <PageHeader title="Edit Tool" description="Tool not found." />
        <Card>
          <p className="text-sm text-gray-600 mb-4">
            No tool matched this slug. Go back to the tools list and pick one.
          </p>
          <PrimaryButton href="/admin/tools">Back to All Tools</PrimaryButton>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Edit: ${tool.name}`}
        description="Catalog details (read-only). Open the editor to manage page content shown on the live tool URL."
        action={
          <Link
            href="/admin/tools"
            className="text-sm font-medium text-[#2596be] hover:text-[#1e7ea1]"
          >
            ← All Tools
          </Link>
        }
      />

      <div className="mb-5">
        <PrimaryButton href={`/admin/tools/editor?slug=${encodeURIComponent(tool.slug)}`}>
          Open Editor
        </PrimaryButton>
        <p className="text-[11px] text-gray-500 mt-2">
          {hasContent
            ? 'Custom page content is saved for this tool.'
            : 'No custom content yet — open the editor to add it.'}
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_280px] gap-5">
        <Card>
          <div className="space-y-4">
            <div>
              <FieldLabel>Name</FieldLabel>
              <TextInput value={tool.name} onChange={() => {}} disabled />
            </div>
            <div>
              <FieldLabel>Slug / URL</FieldLabel>
              <TextInput value={tool.slug} onChange={() => {}} disabled />
              <p className="text-[11px] text-gray-500 mt-1">
                Live URL:{' '}
                <a
                  href={`/tool/${tool.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#2596be] underline"
                >
                  /tool/{tool.slug}
                </a>
              </p>
            </div>
            <div>
              <FieldLabel>Description</FieldLabel>
              <TextArea value={tool.description} onChange={() => {}} rows={3} disabled />
            </div>
            <div>
              <FieldLabel>SEO Title</FieldLabel>
              <TextInput value={tool.seoTitle || tool.name} onChange={() => {}} disabled />
            </div>
            <div>
              <FieldLabel>SEO Description</FieldLabel>
              <TextArea
                value={tool.seoDescription || tool.description}
                onChange={() => {}}
                rows={3}
                disabled
              />
            </div>
            <div>
              <FieldLabel>API Endpoint</FieldLabel>
              <TextInput value={tool.apiEndpoint} onChange={() => {}} disabled />
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card padding="p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Meta
            </p>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-gray-500">Category</dt>
                <dd className="text-gray-900 text-right">{category}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-gray-500">Type</dt>
                <dd className="text-gray-900">
                  {tool.category.startsWith('img-') ? 'Image' : 'PDF'}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-gray-500">Output</dt>
                <dd className="text-gray-900 text-right break-all">{tool.outputFormat}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-gray-500">Page content</dt>
                <dd className="text-gray-900 font-semibold">
                  {hasContent ? 'Custom' : 'Default'}
                </dd>
              </div>
            </dl>
          </Card>
          <Card padding="p-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Use <strong>Open Editor</strong> to write headings, paragraphs, lists, and tables for
              this tool’s public page — same editor as blog posts.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function EditToolPage() {
  return (
    <Suspense fallback={<div className="text-gray-500 text-sm py-10">Loading tool…</div>}>
      <EditToolForm />
    </Suspense>
  );
}
