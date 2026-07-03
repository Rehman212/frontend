import { BlogPostViewer } from '../../components/BlogPostViewer';

export const dynamic = 'force-dynamic';

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <BlogPostViewer slug={slug} />;
}
