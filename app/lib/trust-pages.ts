import { stripHtmlText } from './blog-html';

export type TrustPage = {
  slug: string;
  aliases: string[];
  title: string;
  seoTitle: string;
  seoDescription: string;
  content: string;
};

export const TRUST_PAGES: TrustPage[] = [
  {
    slug: 'about-us',
    aliases: ['about'],
    title: 'About GoDocLab',
    seoTitle: 'About GoDocLab — Free Online PDF & Image Tools',
    seoDescription:
      'GoDocLab is a free online toolkit for PDFs and images. Learn who we are, how files are processed on our servers, and why we don’t require a sign-up.',
    content: `
<p>GoDocLab is a free online toolkit for everyday PDF and image work. We built it so anyone can merge, split, compress, convert, edit, OCR, and process documents in a browser — without installing software or creating an account.</p>
<p>The site is operated as a practical document utility: pick a tool, upload a file over HTTPS, wait for processing, then download the result. That is the whole product.</p>
<h2>What we offer</h2>
<p>GoDocLab covers common PDF jobs (merge, split, compress, convert, protect, OCR, watermark) and image jobs (convert, resize, compress, background removal). Tools run on our servers so large files and format conversions stay reliable on phones, tablets, and desktops.</p>
<h2>How processing works</h2>
<p>Files are uploaded over an encrypted HTTPS connection and processed on GoDocLab servers. They are not processed entirely inside your browser. After processing, files are removed from our servers automatically so your document does not sit in storage.</p>
<p>We do not sell document contents, and we do not use uploaded files to train models. Optional accounts exist only if you want a dashboard; most tools work without signing in.</p>
<h2>Who writes our guides</h2>
<p>Blog articles are published under <strong>GoDocLab Editorial</strong>. Guides explain how to use PDF and image workflows with our tools. For questions about the company or these policies, see the <a href="/contact-us">Contact</a> page.</p>
<h2>Trust and policies</h2>
<ul>
<li><a href="/privacy-policy">Privacy Policy</a> — how files, logs, and cookies are handled</li>
<li><a href="/terms-and-conditions">Terms and Conditions</a> — rules for using the tools</li>
<li><a href="/cookie-policy">Cookie Policy</a> — cookies and similar technologies</li>
<li><a href="/copyright-dmca">Copyright and DMCA</a> — rights and takedown requests</li>
</ul>
<p>If you have questions, see <a href="/contact-us">Contact</a> or our <a href="/privacy-policy">Privacy Policy</a>.</p>
`.trim(),
  },
  {
    slug: 'contact-us',
    aliases: ['contact'],
    title: 'Contact GoDocLab',
    seoTitle: 'Contact GoDocLab — Support and Questions',
    seoDescription:
      'Contact GoDocLab about tool issues, privacy questions, or copyright. We process files on our servers and delete them after use.',
    content: `
<p>Need help with a tool, a privacy question, or a rights request? Use the details below. We read messages about the GoDocLab website and its PDF and image tools.</p>
<h2>How to reach us</h2>
<p>Email: <a href="mailto:hello@godoclab.com">hello@godoclab.com</a></p>
<p>Website: <a href="https://godoclab.com">https://godoclab.com</a></p>
<p>Please include the tool name, what you tried to do, and (if relevant) the error you saw. Do not attach confidential documents unless a support thread specifically asks for a sample file.</p>
<h2>What we can help with</h2>
<ul>
<li>Tool errors, failed conversions, or download issues</li>
<li>Questions about how files are processed and deleted</li>
<li>Privacy or cookie questions</li>
<li>Copyright / DMCA notices (also see <a href="/copyright-dmca">Copyright and DMCA</a>)</li>
</ul>
<h2>What we cannot do</h2>
<p>We cannot recover a file after it has been deleted from our servers. Download your result as soon as processing finishes. We also cannot unlock or process files you do not have the right to use.</p>
<p>For how we handle uploads, see the <a href="/privacy-policy">Privacy Policy</a>.</p>
`.trim(),
  },
  {
    slug: 'privacy-policy',
    aliases: ['privacy'],
    title: 'Privacy Policy',
    seoTitle: 'Privacy Policy | GoDocLab',
    seoDescription:
      'GoDocLab processes uploaded files on our servers over HTTPS and removes them after processing. Read how we handle files, logs, cookies, and accounts.',
    content: `
<p>Last updated: October 2, 2026</p>
<p>This policy explains how GoDocLab (“we”, “us”) handles information when you use godoclab.com and related APIs.</p>
<h2>The short version</h2>
<p>You can use most tools without an account. When you upload a file, it is sent over HTTPS to our servers, processed there, and then removed. We do not process documents entirely in your browser. We do not sell the contents of your files.</p>
<h2>Files you upload</h2>
<p>To run a tool we must receive the file you submit. Processing happens on GoDocLab servers (for example merge, compress, convert, OCR). After the job finishes, processed files are deleted from our servers automatically. We do not keep a personal document archive of guest uploads.</p>
<p>Do not upload files you are not allowed to process. You are responsible for the documents you send.</p>
<h2>Accounts (optional)</h2>
<p>If you create an account, we store the email and credentials needed to sign in, plus any dashboard data you save. You can use the tools without registering.</p>
<h2>Logs and security</h2>
<p>We may keep technical logs (IP address, browser type, timestamps, error codes) to operate the site, prevent abuse, and debug failures. Logs are not used to rebuild the contents of your PDFs.</p>
<h2>Cookies</h2>
<p>We use cookies and similar technologies as described in the <a href="/cookie-policy">Cookie Policy</a>. Some are needed for the site to work; others may be used for analytics or advertising where enabled.</p>
<h2>Third parties</h2>
<p>Hosting, storage, email, and similar providers may process data on our behalf to run the service. We do not sell your document contents to advertisers.</p>
<h2>Your choices</h2>
<p>You can stop using the site at any time. If you have an account, contact us to request deletion of that account. Guest files that have already been removed from processing storage cannot be restored.</p>
<h2>Children</h2>
<p>GoDocLab is not directed at children under 13. Do not upload files that contain a child’s personal information.</p>
<h2>Contact</h2>
<p>Privacy questions: <a href="mailto:hello@godoclab.com">hello@godoclab.com</a> or the <a href="/contact-us">Contact</a> page.</p>
`.trim(),
  },
  {
    slug: 'terms-and-conditions',
    aliases: ['terms', 'terms-of-service'],
    title: 'Terms and Conditions',
    seoTitle: 'Terms and Conditions | GoDocLab',
    seoDescription:
      'Terms for using GoDocLab’s free PDF and image tools: acceptable use, file processing on our servers, and limits of liability.',
    content: `
<p>Last updated: October 2, 2026</p>
<p>By using godoclab.com you agree to these terms. If you do not agree, do not use the tools.</p>
<h2>The service</h2>
<p>GoDocLab provides free online PDF and image utilities. Features may change. We may add, remove, or limit tools, including file-size or rate limits, to keep the service stable.</p>
<h2>No account required</h2>
<p>Most tools work without registration. If you create an account, you are responsible for that login and for activity under it.</p>
<h2>Your files and rights</h2>
<p>You must have the right to upload and process each file. Do not upload malware, stolen documents, or content that violates law. We may refuse or interrupt jobs that look abusive.</p>
<p>Files are processed on our servers and then deleted. You should download results promptly. We are not a backup or storage product.</p>
<h2>Acceptable use</h2>
<p>Do not attack, scrape in a way that harms the service, bypass limits, or use the tools to infringe other people’s rights. Automated bulk use may be blocked.</p>
<h2>Output quality</h2>
<p>Conversions and edits depend on the source file. OCR, layout, and compression can change appearance. Preview results before you rely on them for legal, medical, or archival use.</p>
<h2>Disclaimer</h2>
<p>The service is provided “as is” without warranties of uninterrupted access or perfect output. To the extent allowed by law, GoDocLab is not liable for lost files, lost profits, or damages from using or being unable to use the tools.</p>
<h2>Changes</h2>
<p>We may update these terms. Continued use after an update means you accept the new terms. See also the <a href="/privacy-policy">Privacy Policy</a>.</p>
`.trim(),
  },
  {
    slug: 'cookie-policy',
    aliases: ['cookies', 'cookie'],
    title: 'Cookie Policy',
    seoTitle: 'Cookie Policy | GoDocLab',
    seoDescription:
      'How GoDocLab uses cookies and similar technologies for the website, optional analytics, and advertising where enabled.',
    content: `
<p>Last updated: October 2, 2026</p>
<p>This policy describes cookies and similar technologies on godoclab.com.</p>
<h2>What cookies are</h2>
<p>Cookies are small files stored on your device. We may also use local storage or pixels for similar purposes.</p>
<h2>Cookies we use</h2>
<ul>
<li><strong>Essential</strong> — keep the site working (for example session, security, load balancing). These are needed for uploads and downloads to function.</li>
<li><strong>Preferences</strong> — remember UI choices such as dismissing a banner.</li>
<li><strong>Analytics</strong> — if enabled, help us see which pages are used so we can fix errors and improve tools.</li>
<li><strong>Advertising</strong> — if ads are shown (for example Google AdSense), those partners may set cookies as described in their policies.</li>
</ul>
<h2>Your controls</h2>
<p>You can block or delete cookies in your browser. Blocking essential cookies may break uploads. For ads personalization, use the controls offered by those ad partners or your browser.</p>
<p>File processing itself happens on our servers after you upload; cookies are not a substitute for that processing. See the <a href="/privacy-policy">Privacy Policy</a> for how uploads are handled.</p>
`.trim(),
  },
  {
    slug: 'copyright-dmca',
    aliases: ['dmca', 'copyright'],
    title: 'Copyright and DMCA',
    seoTitle: 'Copyright and DMCA | GoDocLab',
    seoDescription:
      'How to send a copyright or DMCA notice to GoDocLab. You must have the right to process files you upload.',
    content: `
<p>Last updated: October 2, 2026</p>
<p>GoDocLab provides processing tools. You must only upload files you have the right to use. We do not claim ownership of the documents you submit.</p>
<h2>Your responsibility</h2>
<p>If a file contains material owned by someone else, you need permission or another legal basis to process it. Repeat abuse may lead to blocked access.</p>
<h2>Notices</h2>
<p>If you believe content on this website (for example a blog post or a static page) infringes your copyright, email <a href="mailto:hello@godoclab.com">hello@godoclab.com</a> with:</p>
<ul>
<li>Your name and contact details</li>
<li>The work you own and the URL on godoclab.com</li>
<li>A statement that you have a good-faith belief the use is not authorized</li>
<li>A statement that the information is accurate, and that you are the owner or authorized to act</li>
</ul>
<p>Guest uploads are processed and then deleted; we typically cannot retrieve a file that has already been removed from our servers.</p>
<p>See <a href="/terms-and-conditions">Terms</a> and <a href="/contact-us">Contact</a> for more.</p>
`.trim(),
  },
];

const BY_SLUG = new Map<string, TrustPage>();
for (const page of TRUST_PAGES) {
  BY_SLUG.set(page.slug, page);
  for (const alias of page.aliases) BY_SLUG.set(alias, page);
}

export function getTrustPage(slug: string): TrustPage | null {
  return BY_SLUG.get(slug) ?? null;
}

export function trustPageSlugs(): string[] {
  return TRUST_PAGES.map((p) => p.slug);
}

export function cmsContentIsUsable(html: string | undefined | null): boolean {
  const text = stripHtmlText(html || '');
  return text.length >= 80 && !/^no content yet\.?$/i.test(text);
}
