import { CATEGORIES, TOOLS, type Tool } from './tools';

export type ToolFaq = { question: string; answer: string };
export type ToolFeature = { title: string; body: string };

export type ToolPageData = {
  slug: string;
  heroTitle: string;
  heroDescription: string;
  content: string;
  features: ToolFeature[];
  faqs: ToolFaq[];
  createdAt?: string | null;
  updatedAt?: string | null;
  id?: string;
};

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function defaultHowToSteps(tool: Tool): string[] {
  const formats = tool.acceptedFormats
    .replace(/\./g, '')
    .toUpperCase()
    .replace(/,/g, ' / ');
  if (tool.pdfPositionMode) {
    return [
      `Upload your ${formats} file`,
      tool.pdfPositionMode === 'point'
        ? 'Click on the page preview to set the position'
        : 'Drag on the page preview to select an area',
      tool.params &&
      tool.params.some((p) => !['x', 'y', 'width', 'height', 'page', 'pages'].includes(p.name))
        ? 'Fill in the remaining options'
        : 'Review your selection',
      `Process and download ${tool.outputFormat}`,
    ];
  }
  return [
    `Upload your ${formats} file`,
    tool.params && tool.params.length > 0
      ? 'Configure the options'
      : 'Confirm the file looks right',
    `Click Process ${tool.name}`,
    `Download your ${tool.outputFormat}`,
  ];
}

/** Default HTML for How it works + About */
export function defaultToolPageHtml(tool: Tool): string {
  const kind = tool.category.startsWith('img-') ? 'image' : 'PDF';
  const aboutTitle = `A faster way to ${tool.name.toLowerCase().replace(/^free\s+/i, '')}`;
  const aboutLead = tool.seoDescription?.trim() || tool.description;
  const aboutBody = `Use the uploader above, tweak options if needed, then download. No installers, no watermarks, and nothing locked behind a plan — just the ${kind} result you need.`;
  const steps = defaultHowToSteps(tool);
  const stepsHtml = steps
    .map((step, i) => `<li><strong>0${i + 1}.</strong> ${escapeHtml(step)}</li>`)
    .join('');

  return [
    `<h2>How to use ${escapeHtml(tool.name)}</h2>`,
    `<p>Follow these steps on this page:</p>`,
    `<ol>${stepsHtml}</ol>`,
    `<h2>${escapeHtml(aboutTitle)}</h2>`,
    `<p>${escapeHtml(aboutLead)}</p>`,
    `<p>${escapeHtml(aboutBody)}</p>`,
  ].join('\n');
}

export function defaultToolFeatures(tool: Tool): ToolFeature[] {
  const kind = tool.category.startsWith('img-') ? 'image' : 'PDF';
  return [
    {
      title: 'Free, no watermark',
      body: `${tool.name} stays free — download the finished ${kind} without branding or a paywall.`,
    },
    {
      title: 'Private by default',
      body: `Transfers use HTTPS. Files are removed after processing so your ${kind} doesn’t sit on our servers.`,
    },
    {
      title: 'Any device',
      body: 'Phone, tablet, or desktop — open the page, upload, and download. Nothing to install.',
    },
    {
      title: 'Built for speed',
      body: `Skip heavy desktop apps. Most ${kind} jobs finish in seconds so you can keep working.`,
    },
  ];
}

export function defaultToolFaqs(tool: Tool): ToolFaq[] {
  const formats = tool.acceptedFormats
    .split(',')
    .map((f) => f.trim().replace(/^\./, '').toUpperCase())
    .filter(Boolean)
    .join(', ');
  return [
    {
      question: `Is ${tool.name} free?`,
      answer: `Yes. GoDocLab’s ${tool.name} is free to use with no subscription and no watermark on the download.`,
    },
    {
      question: 'Which formats are supported?',
      answer: `Accepted inputs: ${formats || 'see the upload area'}. Typical max size is 100 MB.`,
    },
    {
      question: 'Do I need an account?',
      answer:
        'No. Process and download as a guest. Sign in only if you want files saved to your dashboard.',
    },
    {
      question: 'How is my file handled?',
      answer:
        'Uploads travel over an encrypted connection and are cleaned up after processing. We don’t sell or share your documents.',
    },
    {
      question: `Why use ${tool.name}?`,
      answer: tool.seoDescription?.trim() || tool.description,
    },
  ];
}

/** Full defaults used to seed the visual page editor */
export function defaultToolPageData(tool: Tool): ToolPageData {
  return {
    slug: tool.slug,
    heroTitle: tool.name,
    heroDescription: tool.description,
    content: defaultToolPageHtml(tool),
    features: defaultToolFeatures(tool),
    faqs: defaultToolFaqs(tool),
    createdAt: null,
    updatedAt: null,
  };
}

export function mergeToolPageData(tool: Tool, saved: Partial<ToolPageData> | null): ToolPageData {
  const base = defaultToolPageData(tool);
  if (!saved) return base;
  const hasAny =
    !!(saved.heroTitle?.trim() ||
      saved.heroDescription?.trim() ||
      saved.content?.trim() ||
      (saved.features && saved.features.length) ||
      (saved.faqs && saved.faqs.length));
  if (!hasAny) return base;
  return {
    slug: tool.slug,
    heroTitle: saved.heroTitle?.trim() || base.heroTitle,
    heroDescription: saved.heroDescription?.trim() || base.heroDescription,
    content: saved.content?.trim() || base.content,
    features: saved.features?.length ? saved.features : base.features,
    faqs: saved.faqs?.length ? saved.faqs : base.faqs,
    createdAt: saved.createdAt ?? null,
    updatedAt: saved.updatedAt ?? null,
    id: saved.id,
  };
}

export function relatedToolsFor(tool: Tool) {
  return TOOLS.filter((t) => t.category === tool.category && t.slug !== tool.slug).slice(0, 8);
}

export function categoryLabel(tool: Tool) {
  return CATEGORIES.find((c) => c.id === tool.category)?.label ?? tool.category;
}
