'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import {
  Card,
  FieldLabel,
  PageHeader,
  PrimaryButton,
  SecondaryButton,
  TextArea,
  TextInput,
} from '../components/AdminUi';
import {
  defaultHomePage,
  focusKeywordChecks,
  type HomeFaq,
  type HomePageContent,
  type HomeTextItem,
} from '../../lib/home-page';
import { fetchHomePageContent, saveHomePageContent } from '../lib/home-page-api';

type Tab =
  | 'seo'
  | 'hero'
  | 'popular'
  | 'catalog'
  | 'how'
  | 'trust'
  | 'why'
  | 'reviews'
  | 'faq';

const TABS: { id: Tab; label: string }[] = [
  { id: 'seo', label: 'SEO' },
  { id: 'hero', label: 'Hero' },
  { id: 'popular', label: 'Popular' },
  { id: 'catalog', label: 'Tools grid' },
  { id: 'how', label: 'How it works' },
  { id: 'trust', label: 'Trust' },
  { id: 'why', label: 'Why us' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'faq', label: 'FAQ' },
];

function ItemList({
  items,
  onChange,
  titleLabel = 'Title',
  textLabel = 'Text',
}: {
  items: HomeTextItem[];
  onChange: (next: HomeTextItem[]) => void;
  titleLabel?: string;
  textLabel?: string;
}) {
  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div key={i} className="rounded-lg border border-gray-200 p-3 space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Item {i + 1}</p>
          <TextInput
            value={item.title}
            onChange={(title) => {
              const next = [...items];
              next[i] = { ...item, title };
              onChange(next);
            }}
            placeholder={titleLabel}
          />
          <TextArea
            value={item.text}
            onChange={(text) => {
              const next = [...items];
              next[i] = { ...item, text };
              onChange(next);
            }}
            rows={3}
            placeholder={textLabel}
          />
        </div>
      ))}
    </div>
  );
}

export default function HomeEditorPage() {
  const { token } = useAuth();
  const [data, setData] = useState<HomePageContent>(defaultHomePage());
  const [tab, setTab] = useState<Tab>('hero');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    fetchHomePageContent()
      .then(setData)
      .catch(() => setData(defaultHomePage()))
      .finally(() => setLoading(false));
  }, []);

  const update = (patch: Partial<HomePageContent>) => {
    setData((prev) => ({ ...prev, ...patch }));
  };

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const saved = await saveHomePageContent(token, data);
      setData(saved);
      setMessage('Homepage saved. Live home now uses this copy.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="Homepage" description="Loading…" />
        <Card>
          <p className="text-sm text-gray-500 py-10 text-center">Loading homepage content…</p>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Homepage"
        description="Edit home page copy the same way as tool pages. Empty fields fall back to defaults."
        action={
          <Link href="/" target="_blank" className="text-sm font-medium text-[#2596be]">
            View live
          </Link>
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
        <div className="flex flex-wrap gap-1.5">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                tab === item.id
                  ? 'bg-[#2596be] text-white border-[#2596be]'
                  : 'bg-white text-gray-600 border-gray-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <SecondaryButton
            onClick={() => {
              if (confirm('Reset this editor to default homepage text?')) {
                setData(defaultHomePage());
              }
            }}
          >
            Reset to default
          </SecondaryButton>
          <PrimaryButton onClick={() => void handleSave()} disabled={saving || !token}>
            {saving ? 'Saving…' : 'Save homepage'}
          </PrimaryButton>
        </div>
      </div>

      <Card>
        {tab === 'seo' && (
          <div className="space-y-3 max-w-2xl">
            <div>
              <FieldLabel>Focus keyword</FieldLabel>
              <TextInput
                value={data.focusKeyword}
                onChange={(focusKeyword) => update({ focusKeyword })}
                placeholder="e.g. free pdf tools"
              />
              <p className="mt-1 text-[11px] text-gray-400">
                Primary phrase this homepage should rank for. Used in the meta keywords tag.
              </p>
              {data.focusKeyword.trim() ? (
                <ul className="mt-3 space-y-1.5 text-xs">
                  {(() => {
                    const checks = focusKeywordChecks(data);
                    const rows = [
                      { ok: checks.inTitle, label: 'In SEO title' },
                      { ok: checks.inDescription, label: 'In SEO description' },
                      { ok: checks.inHero, label: 'In hero heading or subtitle' },
                    ];
                    return rows.map((row) => (
                      <li
                        key={row.label}
                        className={row.ok ? 'text-emerald-700' : 'text-red-600'}
                      >
                        {row.ok ? '✓' : '✗'} {row.label}
                      </li>
                    ));
                  })()}
                </ul>
              ) : null}
            </div>
            <div>
              <FieldLabel>SEO title</FieldLabel>
              <TextInput value={data.seoTitle} onChange={(seoTitle) => update({ seoTitle })} />
            </div>
            <div>
              <FieldLabel>SEO description</FieldLabel>
              <TextArea value={data.seoDescription} onChange={(seoDescription) => update({ seoDescription })} rows={3} />
            </div>
          </div>
        )}

        {tab === 'hero' && (
          <div className="space-y-3 max-w-2xl">
            <div>
              <FieldLabel>Badge</FieldLabel>
              <TextInput value={data.heroBadge} onChange={(heroBadge) => update({ heroBadge })} />
            </div>
            <div>
              <FieldLabel>Title (before highlight)</FieldLabel>
              <TextInput value={data.heroTitle} onChange={(heroTitle) => update({ heroTitle })} />
            </div>
            <div>
              <FieldLabel>Highlighted words</FieldLabel>
              <TextInput value={data.heroHighlight} onChange={(heroHighlight) => update({ heroHighlight })} />
            </div>
            <div>
              <FieldLabel>Title (after highlight)</FieldLabel>
              <TextInput value={data.heroAfter} onChange={(heroAfter) => update({ heroAfter })} />
            </div>
            <div>
              <FieldLabel>Subtitle</FieldLabel>
              <TextArea value={data.heroSubtitle} onChange={(heroSubtitle) => update({ heroSubtitle })} rows={3} />
              <p className="mt-1 text-[11px] text-gray-400">Use {'{tools}'} for the live tool count.</p>
            </div>
            <div>
              <FieldLabel>Primary button</FieldLabel>
              <TextInput value={data.heroCtaPrimary} onChange={(heroCtaPrimary) => update({ heroCtaPrimary })} />
            </div>
            <div>
              <FieldLabel>Secondary button</FieldLabel>
              <TextInput value={data.heroCtaSecondary} onChange={(heroCtaSecondary) => update({ heroCtaSecondary })} />
            </div>
            <div>
              <FieldLabel>Trust pills (comma separated)</FieldLabel>
              <TextInput
                value={data.heroTrust.join(', ')}
                onChange={(v) =>
                  update({
                    heroTrust: v.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
              />
            </div>
          </div>
        )}

        {tab === 'popular' && (
          <div className="space-y-3 max-w-2xl">
            <TextInput value={data.popularEyebrow} onChange={(popularEyebrow) => update({ popularEyebrow })} />
            <TextInput value={data.popularTitle} onChange={(popularTitle) => update({ popularTitle })} />
            <TextInput value={data.popularHighlight} onChange={(popularHighlight) => update({ popularHighlight })} />
            <TextArea value={data.popularSubtitle} onChange={(popularSubtitle) => update({ popularSubtitle })} rows={3} />
          </div>
        )}

        {tab === 'catalog' && (
          <div className="space-y-3 max-w-2xl">
            <div>
              <FieldLabel>Heading</FieldLabel>
              <TextInput value={data.catalogTitle} onChange={(catalogTitle) => update({ catalogTitle })} />
            </div>
            <div>
              <FieldLabel>Subtitle</FieldLabel>
              <TextArea value={data.catalogSubtitle} onChange={(catalogSubtitle) => update({ catalogSubtitle })} rows={3} />
            </div>
          </div>
        )}

        {tab === 'how' && (
          <div className="space-y-4 max-w-2xl">
            <TextInput value={data.howEyebrow} onChange={(howEyebrow) => update({ howEyebrow })} />
            <TextInput value={data.howTitle} onChange={(howTitle) => update({ howTitle })} />
            <TextInput value={data.howHighlight} onChange={(howHighlight) => update({ howHighlight })} />
            <TextArea value={data.howSubtitle} onChange={(howSubtitle) => update({ howSubtitle })} rows={2} />
            <ItemList items={data.howSteps} onChange={(howSteps) => update({ howSteps })} />
          </div>
        )}

        {tab === 'trust' && (
          <div className="space-y-4 max-w-2xl">
            <TextInput value={data.trustEyebrow} onChange={(trustEyebrow) => update({ trustEyebrow })} />
            <TextInput value={data.trustTitle} onChange={(trustTitle) => update({ trustTitle })} />
            <TextInput value={data.trustHighlight} onChange={(trustHighlight) => update({ trustHighlight })} />
            <TextArea value={data.trustSubtitle} onChange={(trustSubtitle) => update({ trustSubtitle })} rows={3} />
            <TextInput value={data.trustCtaPrimary} onChange={(trustCtaPrimary) => update({ trustCtaPrimary })} />
            <TextInput value={data.trustCtaSecondary} onChange={(trustCtaSecondary) => update({ trustCtaSecondary })} />
            <ItemList items={data.trustPoints} onChange={(trustPoints) => update({ trustPoints })} />
          </div>
        )}

        {tab === 'why' && (
          <div className="space-y-4 max-w-2xl">
            <TextInput value={data.whyEyebrow} onChange={(whyEyebrow) => update({ whyEyebrow })} />
            <TextInput value={data.whyTitle} onChange={(whyTitle) => update({ whyTitle })} />
            <TextInput value={data.whyHighlight} onChange={(whyHighlight) => update({ whyHighlight })} />
            <TextArea value={data.whySubtitle} onChange={(whySubtitle) => update({ whySubtitle })} rows={2} />
            <p className="text-[11px] text-gray-400">Use {'{tools}'} and {'{categories}'} in the subtitle.</p>
            <ItemList items={data.whyItems} onChange={(whyItems) => update({ whyItems })} />
          </div>
        )}

        {tab === 'reviews' && (
          <div className="space-y-3 max-w-2xl">
            <p className="text-xs text-gray-500">Review cards stay the same. This edits the section heading only.</p>
            <TextInput value={data.reviewsEyebrow} onChange={(reviewsEyebrow) => update({ reviewsEyebrow })} />
            <TextInput value={data.reviewsTitle} onChange={(reviewsTitle) => update({ reviewsTitle })} />
            <TextInput value={data.reviewsHighlight} onChange={(reviewsHighlight) => update({ reviewsHighlight })} />
            <TextArea value={data.reviewsSubtitle} onChange={(reviewsSubtitle) => update({ reviewsSubtitle })} rows={2} />
          </div>
        )}

        {tab === 'faq' && (
          <div className="space-y-4 max-w-2xl">
            <TextInput value={data.faqEyebrow} onChange={(faqEyebrow) => update({ faqEyebrow })} />
            <TextInput value={data.faqTitle} onChange={(faqTitle) => update({ faqTitle })} />
            <TextInput value={data.faqHighlight} onChange={(faqHighlight) => update({ faqHighlight })} />
            <TextArea value={data.faqSubtitle} onChange={(faqSubtitle) => update({ faqSubtitle })} rows={2} />
            <TextInput value={data.faqHelpTitle} onChange={(faqHelpTitle) => update({ faqHelpTitle })} />
            <TextArea value={data.faqHelpText} onChange={(faqHelpText) => update({ faqHelpText })} rows={2} />
            <div className="space-y-3">
              {data.faqs.map((faq, i) => (
                <div key={i} className="rounded-lg border border-gray-200 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">FAQ {i + 1}</p>
                    <button
                      type="button"
                      className="text-xs font-semibold text-red-500"
                      onClick={() => update({ faqs: data.faqs.filter((_, idx) => idx !== i) })}
                    >
                      Remove
                    </button>
                  </div>
                  <TextInput
                    value={faq.question}
                    onChange={(question) => {
                      const faqs = [...data.faqs];
                      faqs[i] = { ...faq, question };
                      update({ faqs });
                    }}
                    placeholder="Question"
                  />
                  <TextArea
                    value={faq.answer}
                    onChange={(answer) => {
                      const faqs = [...data.faqs];
                      faqs[i] = { ...faq, answer };
                      update({ faqs });
                    }}
                    rows={3}
                    placeholder="Answer"
                  />
                </div>
              ))}
              <SecondaryButton
                onClick={() =>
                  update({ faqs: [...data.faqs, { question: '', answer: '' } satisfies HomeFaq] })
                }
              >
                Add FAQ
              </SecondaryButton>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
