import { CmsPageViewerSuspense } from '../components/CmsPageViewer';
import { CMS_RESERVED_SLUGS } from '../admin/lib/cms-store';
import cmsSlugs from '../../public/cms-slugs.json';

export function generateStaticParams() {
  return (cmsSlugs as string[])
    .filter((slug) => !CMS_RESERVED_SLUGS.has(slug))
    .map((slug) => ({ slug }));
}

export default async function CmsSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (CMS_RESERVED_SLUGS.has(slug)) {
    return null;
  }

  return <CmsPageViewerSuspense slug={slug} />;
}
