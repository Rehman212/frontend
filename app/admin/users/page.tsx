'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  FieldLabel,
  PageHeader,
  PrimaryButton,
  SecondaryButton,
  TextInput,
} from '../components/AdminUi';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.godoclab.com/api';

interface UserRow {
  id: number;
  email: string;
  username: string;
  createdAt: string;
}

interface UsersData {
  users: UserRow[];
  total: number;
  page: number;
  limit: number;
}

export default function UsersPage() {
  const { token, user: currentUser } = useAuth();
  const [data, setData] = useState<UsersData | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const load = (p: number) => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    fetch(`${API}/admin/users?page=${p}&limit=20`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (r) => {
        const d = await r.json();
        if (r.status === 401) {
          throw new Error('Session expired — please log out and sign in again at /admin/login');
        }
        if (!r.ok) throw new Error(d.message || 'Failed to load users');
        return d as UsersData;
      })
      .then((d) => {
        setData({
          users: Array.isArray(d.users) ? d.users : [],
          total: d.total ?? 0,
          page: d.page ?? p,
          limit: d.limit ?? 20,
        });
        setLoading(false);
      })
      .catch((err) => {
        setError((err as Error).message || 'Failed to load users');
        setData({ users: [], total: 0, page: p, limit: 20 });
        setLoading(false);
      });
  };

  useEffect(() => {
    load(page);
  }, [token, page]); // eslint-disable-line

  const rows = (data?.users ?? []).filter(
    (u) =>
      !search
      || u.username.toLowerCase().includes(search.toLowerCase())
      || u.email.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!email.trim() || !username.trim() || !password) {
      setFormError('Email, username, and password are required.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const res = await fetch(`${API}/admin/users`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim(), username: username.trim(), password }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || 'Failed to add user');
      setEmail('');
      setUsername('');
      setPassword('');
      setShowForm(false);
      load(page);
    } catch (err) {
      setFormError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!token) return;
    if (id === currentUser?.id) {
      setError('You cannot delete your own account.');
      return;
    }
    if (!confirm(`Remove user "${name}"? This cannot be undone.`)) return;
    setError('');
    try {
      const res = await fetch(`${API}/admin/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || 'Failed to delete user');
      load(page);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div>
      <PageHeader
        title="Users"
        description={
          data
            ? `${data.total.toLocaleString()} CMS users — login to access full dashboard`
            : 'Manage who can access the CMS dashboard'
        }
        action={
          <PrimaryButton onClick={() => setShowForm((v) => !v)}>
            {showForm ? 'Cancel' : '+ Add User'}
          </PrimaryButton>
        }
      />

      {showForm && (
        <form
          onSubmit={handleAddUser}
          className="mb-6 p-5 rounded-xl bg-white border border-gray-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end"
        >
          <div>
            <FieldLabel>Email</FieldLabel>
            <TextInput value={email} onChange={setEmail} placeholder="user@example.com" type="email" />
          </div>
          <div>
            <FieldLabel>Username</FieldLabel>
            <TextInput value={username} onChange={setUsername} placeholder="username" />
          </div>
          <div>
            <FieldLabel>Password</FieldLabel>
            <TextInput value={password} onChange={setPassword} placeholder="••••••••" type="password" />
          </div>
          <div className="flex gap-2">
            <PrimaryButton type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Create User'}
            </PrimaryButton>
            <SecondaryButton type="button" onClick={() => setShowForm(false)}>
              Cancel
            </SecondaryButton>
          </div>
          {formError && (
            <p className="sm:col-span-2 lg:col-span-4 text-sm text-red-500">{formError}</p>
          )}
        </form>
      )}

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by username or email…"
        className="w-full sm:w-72 mb-5 px-4 py-2 rounded-xl text-sm outline-none bg-white border border-gray-200 text-gray-900 focus:border-[#2596be] focus:ring-2 focus:ring-[#2596be]/20"
      />

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      {loading && <Spinner />}

      {!loading && (
        <div className="rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  {['#', 'Username', 'Email', 'Joined', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-bold uppercase tracking-widest text-gray-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors border-b border-gray-100">
                    <td className="px-5 py-3 text-xs text-gray-400">{u.id}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0"
                          style={{ background: 'linear-gradient(135deg,#2596be,#1e7ea1)' }}
                        >
                          {u.username[0]?.toUpperCase() ?? '?'}
                        </div>
                        <span className="text-xs font-semibold text-gray-900">
                          {u.username}
                          {u.id === currentUser?.id && (
                            <span className="ml-1.5 text-[10px] text-gray-400">(you)</span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-500">{u.email}</td>
                    <td className="px-5 py-3 text-xs text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        type="button"
                        disabled={u.id === currentUser?.id}
                        onClick={() => handleDelete(u.id, u.username)}
                        className="text-xs font-medium text-red-500 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-xs text-gray-400">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 bg-gray-50">
              <span className="text-xs text-gray-500">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-30 bg-white border border-gray-200 text-gray-600"
                >
                  ← Prev
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-30 text-white"
                  style={{ background: '#2596be' }}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-24">
      <div
        className="w-8 h-8 rounded-full border-2 animate-spin"
        style={{ borderColor: '#2596be', borderTopColor: 'transparent' }}
      />
    </div>
  );
}
