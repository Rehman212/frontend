'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { IconPlus } from '../components/AdminIcons';
import {
  Badge,
  Card,
  EmptyState,
  PageHeader,
  PrimaryButton,
} from '../components/AdminUi';
import { deletePost, fetchPosts, type BlogPost } from '../lib/posts-api';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function BlogPage() {
  const { token } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPosts = () => {
    if (!token) return;
    setLoading(true);
    fetchPosts(token)
      .then(setPosts)
      .catch(() => setError('Failed to load posts'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPosts();
  }, [token]);

  const removePost = async (id: string) => {
    if (!token) return;
    try {
      await deletePost(token, id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      setError('Failed to delete post');
    }
  };
  
  const published = posts.filter((p) => p.status === 'published').length;
  const drafts = posts.filter((p) => p.status === 'draft').length;

  return (
    <div>
      <PageHeader
        title="Blog"
        description="Manage blog posts and articles for your website."
        action={
          <PrimaryButton href="/admin/blog/new">
            <IconPlus className="w-4 h-4" />
            Add Blog Post
          </PrimaryButton>
        }
      />

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg text-sm bg-red-50 text-red-700 border border-red-100">
          {error}
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Total Posts', value: posts.length },
          { label: 'Published', value: published },
          { label: 'Drafts', value: drafts },
        ].map((s) => (
          <Card key={s.label} padding="p-4">
            <p className="text-2xl font-bold text-gray-900">{loading ? '—' : s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </Card>
        ))}
      </div>

      <Card padding="p-0" className="overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-sm text-gray-500">Loading posts...</div>
        ) : posts.length === 0 ? (
          <EmptyState
            title="No blog posts yet"
            description="Start writing your first article and publish it to your website."
            action={
              <PrimaryButton href="/admin/blog/new">
                <IconPlus className="w-4 h-4" />
                Write first post
              </PrimaryButton>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Author</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr
                    key={post.id}
                    className="hover:bg-gray-50 transition-colors border-b border-gray-100"
                  >
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900">{post.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1 max-w-xs">{post.excerpt || '—'}</p>
                    </td>
                    <td className="px-5 py-4 text-gray-500 text-xs">{post.author}</td>
                    <td className="px-5 py-4">
                      <Badge variant={post.status === 'published' ? 'success' : 'draft'}>
                        {post.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-gray-500 text-xs">{formatDate(post.createdAt)}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {post.status === 'published' && (
                          <a
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-[#2596be] hover:text-[#1e7ea1]"
                          >
                            View
                          </a>
                        )}
                        <Link
                          href={`/admin/blog/new?id=${post.id}`}
                          className="text-xs font-medium text-[#2596be] hover:text-[#1e7ea1]"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => removePost(post.id)}
                          className="text-xs font-medium text-red-500 hover:text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
