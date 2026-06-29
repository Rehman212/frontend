'use client';

import { useMemo } from 'react';
import { MetaBox } from './MetaBox';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.godoclab.com';

const TITLE_MAX = 60;
const DESC_MAX = 160;

type SeoPanelProps = {
  slug: string;
  pageTitle: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  onSeoTitleChange: (v: string) => void;
  onSeoDescriptionChange: (v: string) => void;
  onSeoKeywordsChange: (v: string) => void;
  onSlugChange?: (v: string) => void;
  pathPrefix?: string;
};

function counterColor(len: number, max: number) {
  if (len === 0) return '#646970';
  if (len <= max) return '#00a32a';
  if (len <= max + 10) return '#dba617';
  return '#d63638';
}

export function SeoPanel({
  slug,
  pageTitle,
  seoTitle,
  seoDescription,
  seoKeywords,
  onSeoTitleChange,
  onSeoDescriptionChange,
  onSeoKeywordsChange,
  onSlugChange,
  pathPrefix = '',
}: SeoPanelProps) {
  const finalSlug = slug.trim() || 'your-page';
  const prefix = pathPrefix ? `${pathPrefix.replace(/^\/|\/$/g, '')}/` : '';
  const fullUrl = `${SITE_URL.replace(/\/$/, '')}/${prefix}${finalSlug}`;

  const displayTitle = seoTitle.trim() || pageTitle.trim() || 'Page Title';
  const displayDesc =
    seoDescription.trim() ||
    'Please provide a meta description by editing the snippet below. If you do not, Google will try to find a relevant part of your page to show in the search results.';

  const titleLen = seoTitle.length;
  const descLen = seoDescription.length;

  const score = useMemo(() => {
    let pts = 0;
    if (seoTitle.trim()) pts += 25;
    if (seoTitle.length > 0 && seoTitle.length <= TITLE_MAX) pts += 15;
    if (seoDescription.trim()) pts += 25;
    if (seoDescription.length > 0 && seoDescription.length <= DESC_MAX) pts += 15;
    if (seoKeywords.trim()) pts += 10;
    const kws = seoKeywords.split(',').map((k) => k.trim()).filter(Boolean);
    if (kws.some((k) => displayTitle.toLowerCase().includes(k.toLowerCase()))) pts += 10;
    return Math.min(100, pts);
  }, [seoTitle, seoDescription, seoKeywords, displayTitle]);

  const scoreColor = score >= 80 ? '#00a32a' : score >= 50 ? '#dba617' : '#d63638';
  const scoreLabel = score >= 80 ? 'Good' : score >= 50 ? 'OK' : 'Needs work';

  const inputCls = 'w-full px-2.5 py-2 rounded text-[13px] outline-none';
  const inputStyle = { background: '#fff', border: '1px solid #8c8f94', color: '#1d2327' };
  const labelCls = 'flex items-center justify-between text-xs font-semibold text-[#1d2327] mb-1.5';

  return (
    <MetaBox title="Rank Math SEO">
      <div className="space-y-4">
        {/* Score badge */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#646970]">SEO Score</span>
          <span
            className="text-xs font-bold px-2 py-0.5 rounded"
            style={{ background: `${scoreColor}18`, color: scoreColor }}
          >
            {score}/100 — {scoreLabel}
          </span>
        </div>

        {/* Google Preview */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#646970] mb-2">
            Preview Snippet
          </p>
          <div
            className="rounded p-3"
            style={{ background: '#f6f7f7', border: '1px solid #dcdcde' }}
          >
            <p className="text-[12px] text-[#202124] truncate mb-0.5" style={{ fontFamily: 'Arial, sans-serif' }}>
              {fullUrl}
            </p>
            <p
              className="text-[18px] leading-snug mb-1 truncate"
              style={{ color: '#1a0dab', fontFamily: 'Arial, sans-serif' }}
            >
              {displayTitle.length > 65 ? `${displayTitle.slice(0, 62)}...` : displayTitle}
            </p>
            <p
              className="text-[13px] leading-relaxed line-clamp-2"
              style={{ color: '#4d5156', fontFamily: 'Arial, sans-serif' }}
            >
              {displayDesc.length > 160 ? `${displayDesc.slice(0, 157)}...` : displayDesc}
            </p>
          </div>
        </div>

        {/* URL */}
        <div>
          <label className={labelCls}>
            <span>Page URL</span>
          </label>
          <div className="flex items-center gap-0 rounded overflow-hidden" style={{ border: '1px solid #8c8f94' }}>
            <span
              className="px-2.5 py-2 text-[12px] whitespace-nowrap shrink-0"
              style={{ background: '#f6f7f7', color: '#646970', borderRight: '1px solid #8c8f94' }}
            >
              {SITE_URL.replace(/^https?:\/\//, '').replace(/\/$/, '')}/{prefix}
            </span>
            {onSlugChange ? (
              <input
                type="text"
                value={slug}
                onChange={(e) => onSlugChange(e.target.value)}
                className="flex-1 px-2.5 py-2 text-[13px] outline-none min-w-0"
                style={{ background: '#fff', color: '#1d2327' }}
                placeholder="page-slug"
              />
            ) : (
              <span className="flex-1 px-2.5 py-2 text-[13px] text-[#1d2327]">{finalSlug}</span>
            )}
          </div>
          <p className="text-[11px] text-[#646970] mt-1 break-all">{fullUrl}</p>
        </div>

        {/* SEO Title */}
        <div>
          <label className={labelCls}>
            <span>SEO Title</span>
            <span style={{ color: counterColor(titleLen, TITLE_MAX), fontWeight: 600 }}>
              {titleLen}/{TITLE_MAX}
            </span>
          </label>
          <input
            type="text"
            value={seoTitle}
            onChange={(e) => onSeoTitleChange(e.target.value)}
            placeholder={pageTitle || 'Enter SEO title (defaults to page title)'}
            className={inputCls}
            style={inputStyle}
          />
          {!seoTitle.trim() && pageTitle && (
            <p className="text-[11px] text-[#646970] mt-1">
              Using page title: <em>{pageTitle}</em>
            </p>
          )}
        </div>

        {/* SEO Description */}
        <div>
          <label className={labelCls}>
            <span>SEO Description</span>
            <span style={{ color: counterColor(descLen, DESC_MAX), fontWeight: 600 }}>
              {descLen}/{DESC_MAX}
            </span>
          </label>
          <textarea
            value={seoDescription}
            onChange={(e) => onSeoDescriptionChange(e.target.value)}
            placeholder="Write a compelling meta description for search engines..."
            rows={3}
            className={`${inputCls} resize-y`}
            style={inputStyle}
          />
        </div>

        {/* Target Keywords */}
        <div>
          <label className={labelCls}>
            <span>Target Keywords</span>
            <span className="text-[#646970] font-normal">comma separated</span>
          </label>
          <input
            type="text"
            value={seoKeywords}
            onChange={(e) => onSeoKeywordsChange(e.target.value)}
            placeholder="pdf tools, merge pdf, compress pdf"
            className={inputCls}
            style={inputStyle}
          />
          {seoKeywords.trim() && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {seoKeywords.split(',').map((kw) => kw.trim()).filter(Boolean).map((kw) => {
                const inTitle = displayTitle.toLowerCase().includes(kw.toLowerCase());
                const inDesc = seoDescription.toLowerCase().includes(kw.toLowerCase());
                return (
                  <span
                    key={kw}
                    className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                    style={{
                      background: inTitle || inDesc ? '#00a32a18' : '#d6363818',
                      color: inTitle || inDesc ? '#00a32a' : '#d63638',
                    }}
                  >
                    {kw} {inTitle ? '✓ title' : inDesc ? '✓ desc' : '✗ missing'}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </MetaBox>
  );
}
