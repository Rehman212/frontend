import Link from 'next/link';
import { SiteShell } from '../../components/SiteShell';

export default function BlogPostNotFound() {
  return (
    <SiteShell>
      <div className="flex flex-col items-center justify-center gap-4 px-4 py-32">
        <h1 className="text-2xl font-bold text-gray-800">Post not found</h1>
        <p className="text-gray-500 text-sm text-center max-w-sm">
          This blog post does not exist or is not published yet.
        </p>
        <Link href="/blog" className="text-sm font-semibold text-sky-600 hover:underline">
          ← Back to blog
        </Link>
      </div>
    </SiteShell>
  );
}
