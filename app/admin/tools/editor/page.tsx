'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { RichTextEditor } from '../../components/RichTextEditor';
import {
  Card,
  FieldLabel,
  PageHeader,
  PrimaryButton,
  TextArea,
  TextInput,
} from '../../components/AdminUi';
import { TOOLS } from '../../../lib/tools';
import {
  defaultToolPageData,
  mergeToolPageData,
  type ToolFaq,
  type ToolFeature,
  type ToolPageData,
} from '../../../lib/tool-page-html';
import {
  deleteToolPageContent,
  fetchAdminToolPage,
  saveToolPageContent,
} from '../../lib/tool-pages-api';
import {
  ToolFullPagePreview,
  type EditSection,
} from '../../components/ToolFullPagePreview';

function ToolEditorForm() {
  const { token } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = (searchParams.get('slug') || '').trim();

  const tool = useMemo(() => TOOLS.find((t) => t.slug === slug) ?? null, [slug]);

  const [data, setData] = useState<ToolPageData | null>(null);
  const [savedInDb, setSavedInDb] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [section, setSection] = useState<EditSection>('hero');

  useEffect(() => {
    if (!token || !slug || !tool) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    fetchAdminToolPage(token, slug)
      .then((saved) => {
        const hasSaved = !!(
          saved.heroTitle?.trim() ||
          saved.heroDescription?.trim() ||
          saved.content?.trim() ||
          saved.features?.length ||
          saved.faqs?.length
        );
        setSavedInDb(hasSaved);
        setData(mergeToolPageData(tool, saved));
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [token, slug, tool]);

  const update = (patch: Partial<ToolPageData>) => {
    setData((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  const handleSave = async () => {
    if (!token || !slug || !data) return;
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const saved = await saveToolPageContent(token, slug, data);
      setSavedInDb(true);
      setData(mergeToolPageData(tool!, saved));
      setMessage('Full page saved. Live /tool page now uses this content.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!token || !slug || !tool) return;
    if (!confirm('Delete all saved page content? Live page returns to defaults.')) return;
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await deleteToolPageContent(token, slug);
      setSavedInDb(false);
      setData(defaultToolPageData(tool));
      setMessage('Saved content deleted. Showing defaults again.');
      setSection('hero');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setSaving(false);
    }
  };

  if (!slug || !tool) {
    return (
      <div>
        <PageHeader title="Tool Editor" description="Tool not found." />
        <Card>
          <p className="text-sm text-gray-600 mb-4">Pick a tool from the list first.</p>
          <PrimaryButton href="/admin/tools">Back to All Tools</PrimaryButton>
        </Card>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div>
        <PageHeader title={`Editor: ${tool.name}`} description="Loading full page preview…" />
        <Card>
          <p className="text-sm text-gray-500 py-10 text-center">Loading…</p>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Editor: ${tool.name}`}
        description="Full tool page preview — click any blue-outlined section to edit that block, then Save."
        action={
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={`/tool/${tool.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-[#2596be]"
            >
              View live
            </a>
            <Link
              href={`/admin/tools/edit?slug=${encodeURIComponent(tool.slug)}`}
              className="text-sm font-medium text-gray-600"
            >
              ← Tool details
            </Link>
          </div>
        }
      />

      {(error || message) && (
        <div
          className={`mb-4 px-4 py-3 rounded-lg text-sm border ${
            error
              ? 'bg-red-50 text-red-700 border-red-100'
              : 'bg-emerald-50 text-emerald-800 border-emerald-100'
          }`}
        >
          {error || message}
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] text-gray-500">
          Status:{' '}
          <strong>{savedInDb ? 'Saved in database' : 'Editing defaults (not saved yet)'}</strong>
          {' · '}Click a section on the preview to edit it
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={saving}
            onClick={() => {
              if (confirm('Reset editor to default page text?')) {
                setData(defaultToolPageData(tool));
              }
            }}
            className="px-3 py-2 rounded-lg text-xs font-semibold border border-gray-200 bg-white"
          >
            Reset to default
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => void handleSave()}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
            style={{ background: '#2596be' }}
          >
            {saving ? 'Saving…' : 'Save page'}
          </button>
          <button
            type="button"
            disabled={saving || !savedInDb}
            onClick={() => void handleDelete()}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-red-600 border border-red-200 bg-white disabled:opacity-50"
          >
            Delete saved
          </button>
        </div>
      </div>

      <div className="grid xl:grid-cols-[minmax(0,1fr)_380px] gap-5 items-start">
        {/* Full page preview */}
        <div className="min-w-0">
          <ToolFullPagePreview
            tool={tool}
            data={data}
            editable
            activeSection={section}
            onSelectSection={setSection}
          />
        </div>

        {/* Section editor panel — sticky while preview scrolls */}
        <aside
          className="xl:sticky xl:top-3 space-y-3 xl:max-h-[calc(100vh-5.5rem)] xl:overflow-y-auto xl:overscroll-contain pb-4"
          style={{ alignSelf: 'start' }}
        >
          <Card padding="p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
              Editing:{' '}
              <span className="text-[#2596be]">
                {section === 'hero'
                  ? 'Hero'
                  : section === 'body'
                    ? 'Page content'
                    : section === 'features'
                      ? 'Features'
                      : section === 'faqs'
                        ? 'FAQ'
                        : '—'}
              </span>
            </p>

            {section === 'hero' && (
              <div className="space-y-3">
                <div>
                  <FieldLabel>Hero title</FieldLabel>
                  <TextInput
                    value={data.heroTitle}
                    onChange={(v) => update({ heroTitle: v })}
                  />
                </div>
                <div>
                  <FieldLabel>Hero description</FieldLabel>
                  <TextArea
                    value={data.heroDescription}
                    onChange={(v) => update({ heroDescription: v })}
                    rows={4}
                  />
                </div>
              </div>
            )}

            {section === 'body' && (
              <div className="-mx-1">
                <p className="text-[11px] text-gray-500 mb-2 px-1">
                  How it works + About (headings, lists, tables…)
                </p>
                <div className="rounded-lg overflow-hidden border border-gray-200">
                  <RichTextEditor
                    value={data.content}
                    onChange={(html) => update({ content: html })}
                  />
                </div>
              </div>
            )}

            {section === 'features' && (
              <FeaturesEditor
                features={data.features}
                onChange={(features) => update({ features })}
              />
            )}

            {section === 'faqs' && (
              <FaqsEditor faqs={data.faqs} onChange={(faqs) => update({ faqs })} />
            )}

            {!section && (
              <p className="text-sm text-gray-500">
                Click a section on the full page preview to start editing.
              </p>
            )}
          </Card>

          <div className="flex flex-wrap gap-2">
            {(
              [
                ['hero', 'Hero'],
                ['body', 'Content'],
                ['features', 'Features'],
                ['faqs', 'FAQ'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setSection(id)}
                className="px-2.5 py-1.5 rounded text-[11px] font-semibold border"
                style={{
                  background: section === id ? '#e0f2fe' : '#fff',
                  borderColor: section === id ? '#2596be' : '#e5e7eb',
                  color: section === id ? '#0369a1' : '#64748b',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => router.push('/admin/tools')}
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Back to All Tools
          </button>
        </aside>
      </div>
    </div>
  );
}

function FeaturesEditor({
  features,
  onChange,
}: {
  features: ToolFeature[];
  onChange: (f: ToolFeature[]) => void;
}) {
  const setAt = (index: number, patch: Partial<ToolFeature>) => {
    onChange(features.map((f, i) => (i === index ? { ...f, ...patch } : f)));
  };
  return (
    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
      {features.map((f, i) => (
        <div key={i} className="rounded-lg border border-gray-200 p-3 space-y-2 bg-gray-50">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-gray-400">Feature {i + 1}</span>
            <button
              type="button"
              className="text-[11px] text-red-500 font-semibold"
              onClick={() => onChange(features.filter((_, j) => j !== i))}
            >
              Remove
            </button>
          </div>
          <TextInput value={f.title} onChange={(v) => setAt(i, { title: v })} placeholder="Title" />
          <TextArea value={f.body} onChange={(v) => setAt(i, { body: v })} rows={2} placeholder="Body" />
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...features, { title: '', body: '' }])}
        className="w-full py-2 rounded-lg text-xs font-semibold border border-dashed border-gray-300 text-[#2596be]"
      >
        + Add feature
      </button>
    </div>
  );
}

function FaqsEditor({
  faqs,
  onChange,
}: {
  faqs: ToolFaq[];
  onChange: (f: ToolFaq[]) => void;
}) {
  const setAt = (index: number, patch: Partial<ToolFaq>) => {
    onChange(faqs.map((f, i) => (i === index ? { ...f, ...patch } : f)));
  };
  return (
    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
      {faqs.map((f, i) => (
        <div key={i} className="rounded-lg border border-gray-200 p-3 space-y-2 bg-gray-50">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-gray-400">FAQ {i + 1}</span>
            <button
              type="button"
              className="text-[11px] text-red-500 font-semibold"
              onClick={() => onChange(faqs.filter((_, j) => j !== i))}
            >
              Remove
            </button>
          </div>
          <TextInput
            value={f.question}
            onChange={(v) => setAt(i, { question: v })}
            placeholder="Question"
          />
          <TextArea
            value={f.answer}
            onChange={(v) => setAt(i, { answer: v })}
            rows={3}
            placeholder="Answer"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...faqs, { question: '', answer: '' }])}
        className="w-full py-2 rounded-lg text-xs font-semibold border border-dashed border-gray-300 text-[#2596be]"
      >
        + Add FAQ
      </button>
    </div>
  );
}

export default function ToolEditorPage() {
  return (
    <Suspense fallback={<div className="text-gray-500 text-sm py-10">Loading editor…</div>}>
      <ToolEditorForm />
    </Suspense>
  );
}
