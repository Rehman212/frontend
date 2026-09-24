import Link from 'next/link';
import { TOOLS, type Tool } from '../lib/tools';
import { blogPostPath } from '../lib/site';
import type { BlogPost } from '../admin/lib/posts-api';
import type { TocItem } from '../lib/blog-toc';

const POPULAR_SLUGS = [
  'merge-pdf',
  'split-pdf',
  'compress-pdf',
  'pdf-to-word',
  'word-to-pdf',
  'ocr-pdf',
];

function getPopularTools(): Tool[] {
  return POPULAR_SLUGS.map((slug) => TOOLS.find((t) => t.slug === slug)).filter(Boolean) as Tool[];
}

function toolsMatchingPost(title: string, content: string): Tool[] {
  const hay = `${title} ${content}`.toLowerCase();
  const hits = TOOLS.filter((t) => {
    const name = t.name.toLowerCase();
    const slug = t.slug.replace(/-/g, ' ');
    return hay.includes(name) || hay.includes(slug);
  }).slice(0, 4);
  if (hits.length >= 3) return hits;
  const popular = getPopularTools();
  const merged = [...hits];
  for (const t of popular) {
    if (!merged.some((m) => m.slug === t.slug)) merged.push(t);
    if (merged.length >= 6) break;
  }
  return merged.slice(0, 6);
}

export function BlogPostSidebar({
  postTitle,
  postContent,
  toc,
  related,
}: {
  postTitle: string;
  postContent: string;
  toc: TocItem[];
  related: BlogPost[];
}) {
  const tools = toolsMatchingPost(postTitle, postContent);

  return (
    <aside className="lg:sticky lg:top-24 lg:self-start rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {toc.length > 0 && (
        <div className="p-5 border-b border-slate-100">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#2596be] mb-3">
            On this page
          </p>
          <nav className="space-y-1 max-h-52 overflow-y-auto overscroll-contain pr-1">
            {toc.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`block text-[13px] leading-snug text-slate-600 hover:text-[#2596be] transition-colors py-1 ${
                  item.level === 3 ? 'pl-3 border-l-2 border-slate-200' : 'font-medium'
                }`}
              >
                {item.text}
              </a>
            ))}
          </nav>
        </div>
      )}

      <div className="p-5 border-b border-slate-100">
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#2596be] mb-1">
          Free tools
        </p>
        <p className="text-sm font-bold text-slate-900 mb-3">Try these next</p>
        <ul className="space-y-1">
          {tools.map((tool) => (
            <li key={tool.slug}>
              <Link
                href={`/tool/${tool.slug}`}
                className="group flex items-center gap-2.5 rounded-lg px-2 py-2 -mx-1 hover:bg-slate-50 transition-colors"
              >
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                  style={{
                    background: tool.bgColor,
                    border: `1px solid ${tool.borderColor}`,
                  }}
                >
                  {tool.icon}
                </span>
                <span className="min-w-0">
                  <span className="block text-[13px] font-semibold text-slate-900 group-hover:text-[#2596be] truncate transition-colors">
                    {tool.name}
                  </span>
                  <span className="block text-[11px] text-slate-500 truncate">
                    {tool.description}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href="/tools"
          className="mt-3 inline-flex text-xs font-bold text-[#2596be] hover:underline"
        >
          Browse all tools →
        </Link>
      </div>

      {related.length > 0 && (
        <div className="p-5 border-b border-slate-100">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#2596be] mb-1">
            Keep reading
          </p>
          <p className="text-sm font-bold text-slate-900 mb-3">More articles</p>
          <ul className="space-y-3.5">
            {related.map((p) => (
              <li key={p.id}>
                <Link href={blogPostPath(p.slug)} className="group flex gap-2.5">
                  <div className="w-14 h-12 rounded-md overflow-hidden bg-slate-100 shrink-0">
                    {p.featuredImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.featuredImage}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full"
                        style={{
                          background: 'linear-gradient(135deg, #112240, #2596be)',
                        }}
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-slate-900 leading-snug line-clamp-2 group-hover:text-[#2596be] transition-colors">
                      {p.title}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      {new Date(p.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div
        className="p-5 text-white"
        style={{
          background: 'linear-gradient(145deg, #0f172a 0%, #1e3a5f 60%, #2596be 140%)',
        }}
      >
        <p className="text-sm font-bold leading-snug">Free PDF tools — no signup</p>
        <p className="mt-1 text-xs text-slate-300 leading-relaxed">
          Compress, merge, convert &amp; edit in your browser.
        </p>
        <Link
          href="/"
          className="mt-3 inline-flex rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-slate-900 hover:bg-sky-50 transition-colors"
        >
          Open tools →
        </Link>
      </div>
    </aside>
  );
}
