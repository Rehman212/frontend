import { BlogPostViewer } from '../../components/BlogPostViewer';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.godoclab.com/api';

async function getPublishedSlugs(): Promise<string[]> {
  try {
    const res = await fetch(`${API}/posts`, { cache: 'no-store' });
    if (!res.ok) return [];
    const posts: { slug: string }[] = await res.json();
    return posts.map((p) => p.slug).filter(Boolean);
  } catch {
    return [];
  }
}

export async function generateStaticParams() {
  const slugs = await getPublishedSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <BlogPostViewer slug={slug} />;
}
