export type HomeTextItem = { title: string; text: string };
export type HomeFaq = { question: string; answer: string };

export type HomePageContent = {
  seoTitle: string;
  seoDescription: string;
  focusKeyword: string;
  heroBadge: string;
  heroTitle: string;
  heroHighlight: string;
  heroAfter: string;
  heroSubtitle: string;
  heroCtaPrimary: string;
  heroCtaSecondary: string;
  heroTrust: string[];
  popularEyebrow: string;
  popularTitle: string;
  popularHighlight: string;
  popularSubtitle: string;
  catalogTitle: string;
  catalogSubtitle: string;
  howEyebrow: string;
  howTitle: string;
  howHighlight: string;
  howSubtitle: string;
  howSteps: HomeTextItem[];
  trustEyebrow: string;
  trustTitle: string;
  trustHighlight: string;
  trustSubtitle: string;
  trustCtaPrimary: string;
  trustCtaSecondary: string;
  trustPoints: HomeTextItem[];
  whyEyebrow: string;
  whyTitle: string;
  whyHighlight: string;
  whySubtitle: string;
  whyItems: HomeTextItem[];
  reviewsEyebrow: string;
  reviewsTitle: string;
  reviewsHighlight: string;
  reviewsSubtitle: string;
  faqEyebrow: string;
  faqTitle: string;
  faqHighlight: string;
  faqSubtitle: string;
  faqHelpTitle: string;
  faqHelpText: string;
  faqs: HomeFaq[];
};

export function defaultHomePage(): HomePageContent {
  return {
    seoTitle: 'GoDocLab — Every PDF Tool You Need',
    seoDescription:
      'Merge, split, compress, convert, rotate, watermark, protect PDFs and more. Files are processed securely on GoDocLab servers and removed after use. 100% free, no sign-up.',
    focusKeyword: '',
    heroBadge: 'Free · No sign-up · Instant download',
    heroTitle: 'Transform Any',
    heroHighlight: 'PDF or Image',
    heroAfter: 'in Seconds',
    heroSubtitle:
      'Merge, compress, convert, OCR, watermark, remove backgrounds and more — {tools}+ professional tools, 100% free forever.',
    heroCtaPrimary: 'Browse All Tools',
    heroCtaSecondary: 'Merge PDF — Most Popular',
    heroTrust: ['Secure processing', 'Instant results', 'No sign-up'],
    popularEyebrow: 'Popular Tools',
    popularTitle: 'Most Used',
    popularHighlight: 'Tools',
    popularSubtitle: 'Jump straight to our top PDF and image tools — hover to pause, click to open instantly.',
    catalogTitle: 'Every tool you need to work with PDFs & images',
    catalogSubtitle:
      'All tools are 100% free and easy to use. Merge, split, compress, convert, edit and more — right in your browser.',
    howEyebrow: 'How It Works',
    howTitle: 'How Our Tools',
    howHighlight: 'Work',
    howSubtitle: 'Four simple steps — from upload to download. No account, no installation, no hassle.',
    howSteps: [
      {
        title: 'Pick a Tool',
        text: 'Browse PDF or image categories and open the tool you need — merge, compress, convert and more.',
      },
      {
        title: 'Upload Your File',
        text: 'Drag & drop or select files from your device. Most tools support PDF, Word, Excel, JPG, PNG and more.',
      },
      {
        title: 'Process Instantly',
        text: 'Our servers process the file over HTTPS in seconds. Adjust settings if needed — quality, format, pages and more.',
      },
      {
        title: 'Download Result',
        text: 'Download your result right away. Files are then removed from our servers. No watermarks, no sign-up.',
      },
    ],
    trustEyebrow: 'Your files are safe',
    trustTitle: 'Process PDFs & Images',
    trustHighlight: 'With Confidence',
    trustSubtitle:
      'Files travel over HTTPS, are processed on GoDocLab servers, then removed automatically. You can focus on the result — not leftover copies of your documents.',
    trustCtaPrimary: 'Try Securely — Free',
    trustCtaSecondary: 'Browse All Tools',
    trustPoints: [
      { title: 'Encrypted transfers', text: 'Every upload uses secure HTTPS encryption end to end.' },
      { title: 'Auto file deletion', text: 'Processed files are removed from our servers automatically.' },
      { title: 'Private by design', text: 'We never share, sell or manually review your documents.' },
      { title: 'No account required', text: 'Use any tool instantly — no sign-up means less data stored.' },
    ],
    whyEyebrow: 'Why Choose Us',
    whyTitle: 'The Smarter Way to Handle',
    whyHighlight: 'PDFs & Images',
    whySubtitle: '{tools}+ tools across {categories} categories — built for speed, privacy and zero hassle.',
    whyItems: [
      {
        title: '100% Free Forever',
        text: 'Every tool is completely free — no trials, no paywalls, and no hidden charges on any feature.',
      },
      {
        title: 'Lightning Fast',
        text: 'Upload, process and download in seconds. Optimized servers deliver results without the wait.',
      },
      {
        title: 'Secure & Private',
        text: 'Your files are handled with care. Secure processing and automatic deletion after use.',
      },
      {
        title: 'No Sign-up Needed',
        text: 'Start using any tool instantly. No account, no email verification — just open and go.',
      },
      {
        title: 'No software to install',
        text: 'Open any tool in your browser on Windows, Mac, Linux, iOS or Android. Processing still runs on our servers.',
      },
      {
        title: 'Professional Quality',
        text: 'Enterprise-grade PDF and image processing — merge, OCR, compress, convert and more in one hub.',
      },
    ],
    reviewsEyebrow: 'Reviews',
    reviewsTitle: 'Loved by',
    reviewsHighlight: 'Thousands',
    reviewsSubtitle: 'See what professionals, students and teams say about our free PDF and image tools.',
    faqEyebrow: 'FAQs',
    faqTitle: 'Frequently Asked',
    faqHighlight: 'Questions',
    faqSubtitle: 'Got questions? Here are answers to the most common ones about our free PDF and image tools.',
    faqHelpTitle: 'Still need help?',
    faqHelpText: 'Visit any tool page and start processing — most issues are resolved by using the right file format.',
    faqs: [
      {
        question: 'Are all tools really free?',
        answer:
          'Yes. Every PDF and image tool on GoDocLab is 100% free with no hidden fees, subscriptions, or premium tiers. You can use any tool as many times as you need.',
      },
      {
        question: 'Do I need to create an account?',
        answer:
          'No account is required for most tools. Simply open a tool, upload your file, and download the result. Signing up is optional if you want to save files to your dashboard.',
      },
      {
        question: 'Is my data safe and private?',
        answer:
          'Files are uploaded over HTTPS and processed on GoDocLab servers — not entirely in your browser. After processing, files are deleted from our servers. We do not sell or share your documents.',
      },
      {
        question: 'What file formats are supported?',
        answer:
          'We support PDF, Word, Excel, PowerPoint, JPG, PNG, WebP, HTML, EPUB and many more depending on the tool. Each tool page shows its accepted formats before you upload.',
      },
      {
        question: 'Is there a file size limit?',
        answer:
          'Most tools support large files, though limits may vary by tool and server capacity. If a file is too large, try compressing it first or splitting it into smaller parts.',
      },
      {
        question: 'Does it work on mobile phones?',
        answer:
          'Yes. All tools run in your browser and work on phones, tablets, and desktops — no app installation needed on any device.',
      },
      {
        question: 'Will there be watermarks on my files?',
        answer:
          'No. Processed files are delivered without watermarks. What you download is your clean, finished file.',
      },
      {
        question: 'Can I use these tools for commercial work?',
        answer:
          'Yes. You may use our tools for personal and commercial projects. Please ensure you have the right to process any files you upload.',
      },
    ],
  };
}

function pick(saved: string | undefined, fallback: string) {
  const value = (saved ?? '').trim();
  return value || fallback;
}

function mergeItems(saved: HomeTextItem[] | undefined, fallback: HomeTextItem[]): HomeTextItem[] {
  if (!saved?.length) return fallback.map((item) => ({ ...item }));
  return fallback.map((item, i) => ({
    title: pick(saved[i]?.title, item.title),
    text: pick(saved[i]?.text, item.text),
  }));
}

export function mergeHomePage(saved?: Partial<HomePageContent> | null): HomePageContent {
  const base = defaultHomePage();
  if (!saved) return base;
  const faqs = (saved.faqs ?? [])
    .map((faq) => ({ question: (faq.question ?? '').trim(), answer: (faq.answer ?? '').trim() }))
    .filter((faq) => faq.question && faq.answer);
  const trust = (saved.heroTrust ?? []).map((s) => s.trim()).filter(Boolean);
  return {
    ...base,
    seoTitle: pick(saved.seoTitle, base.seoTitle),
    seoDescription: pick(saved.seoDescription, base.seoDescription),
    focusKeyword: (saved.focusKeyword ?? '').trim(),
    heroBadge: pick(saved.heroBadge, base.heroBadge),
    heroTitle: pick(saved.heroTitle, base.heroTitle),
    heroHighlight: pick(saved.heroHighlight, base.heroHighlight),
    heroAfter: pick(saved.heroAfter, base.heroAfter),
    heroSubtitle: pick(saved.heroSubtitle, base.heroSubtitle),
    heroCtaPrimary: pick(saved.heroCtaPrimary, base.heroCtaPrimary),
    heroCtaSecondary: pick(saved.heroCtaSecondary, base.heroCtaSecondary),
    heroTrust: trust.length ? trust : [...base.heroTrust],
    popularEyebrow: pick(saved.popularEyebrow, base.popularEyebrow),
    popularTitle: pick(saved.popularTitle, base.popularTitle),
    popularHighlight: pick(saved.popularHighlight, base.popularHighlight),
    popularSubtitle: pick(saved.popularSubtitle, base.popularSubtitle),
    catalogTitle: pick(saved.catalogTitle, base.catalogTitle),
    catalogSubtitle: pick(saved.catalogSubtitle, base.catalogSubtitle),
    howEyebrow: pick(saved.howEyebrow, base.howEyebrow),
    howTitle: pick(saved.howTitle, base.howTitle),
    howHighlight: pick(saved.howHighlight, base.howHighlight),
    howSubtitle: pick(saved.howSubtitle, base.howSubtitle),
    howSteps: mergeItems(saved.howSteps, base.howSteps),
    trustEyebrow: pick(saved.trustEyebrow, base.trustEyebrow),
    trustTitle: pick(saved.trustTitle, base.trustTitle),
    trustHighlight: pick(saved.trustHighlight, base.trustHighlight),
    trustSubtitle: pick(saved.trustSubtitle, base.trustSubtitle),
    trustCtaPrimary: pick(saved.trustCtaPrimary, base.trustCtaPrimary),
    trustCtaSecondary: pick(saved.trustCtaSecondary, base.trustCtaSecondary),
    trustPoints: mergeItems(saved.trustPoints, base.trustPoints),
    whyEyebrow: pick(saved.whyEyebrow, base.whyEyebrow),
    whyTitle: pick(saved.whyTitle, base.whyTitle),
    whyHighlight: pick(saved.whyHighlight, base.whyHighlight),
    whySubtitle: pick(saved.whySubtitle, base.whySubtitle),
    whyItems: mergeItems(saved.whyItems, base.whyItems),
    reviewsEyebrow: pick(saved.reviewsEyebrow, base.reviewsEyebrow),
    reviewsTitle: pick(saved.reviewsTitle, base.reviewsTitle),
    reviewsHighlight: pick(saved.reviewsHighlight, base.reviewsHighlight),
    reviewsSubtitle: pick(saved.reviewsSubtitle, base.reviewsSubtitle),
    faqEyebrow: pick(saved.faqEyebrow, base.faqEyebrow),
    faqTitle: pick(saved.faqTitle, base.faqTitle),
    faqHighlight: pick(saved.faqHighlight, base.faqHighlight),
    faqSubtitle: pick(saved.faqSubtitle, base.faqSubtitle),
    faqHelpTitle: pick(saved.faqHelpTitle, base.faqHelpTitle),
    faqHelpText: pick(saved.faqHelpText, base.faqHelpText),
    faqs: faqs.length ? faqs : base.faqs.map((faq) => ({ ...faq })),
  };
}

export function fillHomeVars(
  text: string,
  vars: { tools?: number; categories?: number } = {},
) {
  return (text || '')
    .replace(/\{tools\}/g, String(vars.tools ?? ''))
    .replace(/\{categories\}/g, String(vars.categories ?? ''));
}

export function focusKeywordChecks(content: HomePageContent) {
  const keyword = content.focusKeyword.trim().toLowerCase();
  if (!keyword) {
    return { keyword: '', inTitle: false, inDescription: false, inHero: false };
  }
  const hero = [
    content.heroTitle,
    content.heroHighlight,
    content.heroAfter,
    content.heroSubtitle,
  ]
    .join(' ')
    .toLowerCase();
  return {
    keyword: content.focusKeyword.trim(),
    inTitle: content.seoTitle.toLowerCase().includes(keyword),
    inDescription: content.seoDescription.toLowerCase().includes(keyword),
    inHero: hero.includes(keyword),
  };
}
