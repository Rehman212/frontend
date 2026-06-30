import { BlogPostViewer } from '../../components/BlogPostViewer';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.godoclab.com/api';

export const dynamicParams = false;

async function getPublishedSlugs(): Promise<string[]> {
  try {
    const res = await fetch(`${API}/posts`);
    if (!res.ok) return [];
    const posts: { slug: string }[] = await res.json();
    return posts.map((p) => p.slug).filter(Boolean);
  } catch {
    return [];
  }
}

export async function generateStaticParams() {
  const slugs = await getPublishedSlugs();
  const exportSlugs = slugs.length > 0 ? slugs : ['__blog_shell__'];
  return exportSlugs.map((slug) => ({ slug }));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <BlogPostViewer slug={slug} />;
}
