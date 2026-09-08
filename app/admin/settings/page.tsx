'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSiteBranding } from '../../context/BrandingContext';
import {
  Card,
  FieldLabel,
  PageHeader,
  PrimaryButton,
  SecondaryButton,
  TextInput,
} from '../components/AdminUi';
import { fetchSiteSettings, updateSiteSettings } from '../lib/posts-api';

const API = process.env.NEXT_PUBLIC_API_URL || 'https://api.godoclab.com/api';

async function uploadLogo(token: string, file: File, kind: 'header' | 'footer') {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('kind', kind);
  const res = await fetch(`${API}/admin/media`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(data.message || 'Logo upload failed');
  }
  const data = (await res.json()) as { url: string };
  return data.url;
}

export default function SettingsPage() {
  const { user, token, updateProfile } = useAuth();
  const { branding, setBrandingLocal } = useSiteBranding();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [headerLogo, setHeaderLogo] = useState(branding.headerLogo);
  const [footerLogo, setFooterLogo] = useState(branding.footerLogo);

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingBrand, setSavingBrand] = useState(false);
  const [uploading, setUploading] = useState<'header' | 'footer' | null>(null);
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');
  const [brandMsg, setBrandMsg] = useState('');
  const [brandErr, setBrandErr] = useState('');

  const [blogPostsPerPage, setBlogPostsPerPage] = useState('9');
  const [savingBlog, setSavingBlog] = useState(false);
  const [blogMsg, setBlogMsg] = useState('');
  const [blogErr, setBlogErr] = useState('');

  useEffect(() => {
    if (!user) return;
    setUsername(user.username);
    setEmail(user.email);
  }, [user]);

  useEffect(() => {
    setHeaderLogo(branding.headerLogo);
    setFooterLogo(branding.footerLogo);
  }, [branding]);

  useEffect(() => {
    fetchSiteSettings()
      .then((s) => setBlogPostsPerPage(String(s.blogPostsPerPage)))
      .catch(() => undefined);
  }, []);

  if (!user || !token) return null;

  const handleSaveProfile = async () => {
    setProfileErr('');
    setProfileMsg('');

    if (!username.trim() || !email.trim()) {
      setProfileErr('Name and email are required.');
      return;
    }
    if (newPassword || confirmPassword || currentPassword) {
      if (!newPassword) {
        setProfileErr('Enter a new password or clear the password fields.');
        return;
      }
      if (newPassword.length < 6) {
        setProfileErr('New password must be at least 6 characters.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setProfileErr('New password and confirm password do not match.');
        return;
      }
      if (!currentPassword) {
        setProfileErr('Current password is required to change password.');
        return;
      }
    }

    setSavingProfile(true);
    try {
      await updateProfile({
        username: username.trim(),
        email: email.trim(),
        ...(newPassword
          ? { currentPassword, newPassword }
          : {}),
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setProfileMsg('Account settings saved.');
    } catch (e) {
      setProfileErr(e instanceof Error ? e.message : 'Failed to save profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleLogoPick = async (kind: 'header' | 'footer', file: File | null) => {
    if (!file) return;
    setBrandErr('');
    setBrandMsg('');
    setUploading(kind);
    try {
      const url = await uploadLogo(token, file, kind);
      if (kind === 'header') setHeaderLogo(url);
      else setFooterLogo(url);
    } catch (e) {
      setBrandErr(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(null);
    }
  };

  const handleSaveBranding = async () => {
    setBrandErr('');
    setBrandMsg('');
    setSavingBrand(true);
    try {
      const res = await fetch('/api/site-branding', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ headerLogo, footerLogo }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { message?: string };
        throw new Error(data.message || 'Failed to save logos');
      }
      const next = (await res.json()) as { headerLogo: string; footerLogo: string };
      setBrandingLocal(next);
      setBrandMsg('Header & footer logos updated. Refresh the site to confirm.');
    } catch (e) {
      setBrandErr(e instanceof Error ? e.message : 'Failed to save logos');
    } finally {
      setSavingBrand(false);
    }
  };

  const handleSaveBlog = async () => {
    setBlogErr('');
    setBlogMsg('');
    const n = Number(blogPostsPerPage);
    if (!Number.isFinite(n) || n < 3 || n > 48) {
      setBlogErr('Posts per page must be between 3 and 48.');
      return;
    }
    setSavingBlog(true);
    try {
      const saved = await updateSiteSettings(token, { blogPostsPerPage: Math.round(n) });
      setBlogPostsPerPage(String(saved.blogPostsPerPage));
      setBlogMsg('Blog listing updated.');
    } catch (e) {
      setBlogErr(e instanceof Error ? e.message : 'Failed to save blog settings');
    } finally {
      setSavingBlog(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Update your account, logos, and how the public blog listing is shown."
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 max-w-5xl">
        {/* Account */}
        <Card>
          <h2 className="text-sm font-bold text-gray-900 mb-4">Account</h2>
          <div className="space-y-4">
            <div>
              <FieldLabel>Name</FieldLabel>
              <TextInput value={username} onChange={setUsername} placeholder="Your name" />
            </div>
            <div>
              <FieldLabel>Email</FieldLabel>
              <TextInput value={email} onChange={setEmail} placeholder="admin@example.com" />
            </div>
          </div>

          <h3 className="text-sm font-bold text-gray-900 mt-8 mb-4">Change Password</h3>
          <div className="space-y-4">
            <div>
              <FieldLabel>Current Password</FieldLabel>
              <TextInput
                value={currentPassword}
                onChange={setCurrentPassword}
                placeholder="••••••••"
                type="password"
              />
            </div>
            <div>
              <FieldLabel>New Password</FieldLabel>
              <TextInput
                value={newPassword}
                onChange={setNewPassword}
                placeholder="At least 6 characters"
                type="password"
              />
            </div>
            <div>
              <FieldLabel>Confirm New Password</FieldLabel>
              <TextInput
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Repeat new password"
                type="password"
              />
            </div>
          </div>

          {profileErr && (
            <p className="mt-4 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {profileErr}
            </p>
          )}
          {profileMsg && (
            <p className="mt-4 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
              {profileMsg}
            </p>
          )}

          <div className="mt-5">
            <PrimaryButton onClick={handleSaveProfile} disabled={savingProfile}>
              {savingProfile ? 'Saving…' : 'Save Account'}
            </PrimaryButton>
          </div>
        </Card>

        {/* Branding */}
        <Card>
          <h2 className="text-sm font-bold text-gray-900 mb-1">Site Logos</h2>
          <p className="text-xs text-gray-500 mb-5">
            PNG, WebP or JPG · max 500KB. Stored in cloud (S3) so live site can load them.
          </p>

          <div className="space-y-6">
            <div>
              <FieldLabel>Header Logo</FieldLabel>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 flex items-center justify-center min-h-[96px] mb-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={headerLogo}
                  alt="Header logo preview"
                  className="max-h-16 w-auto object-contain"
                />
              </div>
              <input
                type="file"
                accept=".png,.webp,.jpg,.jpeg,.svg,image/png,image/webp,image/jpeg,image/svg+xml"
                disabled={!!uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  e.target.value = '';
                  void handleLogoPick('header', file);
                }}
                className="block w-full text-xs text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#2596be]/10 file:text-[#1e7ea1]"
              />
              <p className="text-[11px] text-gray-400 mt-1.5">
                {uploading === 'header' ? 'Uploading…' : headerLogo}
              </p>
            </div>

            <div>
              <FieldLabel>Footer Logo</FieldLabel>
              <div className="rounded-xl border border-gray-200 bg-slate-900 p-4 flex items-center justify-center min-h-[96px] mb-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={footerLogo}
                  alt="Footer logo preview"
                  className="max-h-16 w-auto object-contain brightness-0 invert"
                />
              </div>
              <input
                type="file"
                accept=".png,.webp,.jpg,.jpeg,.svg,image/png,image/webp,image/jpeg,image/svg+xml"
                disabled={!!uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  e.target.value = '';
                  void handleLogoPick('footer', file);
                }}
                className="block w-full text-xs text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#2596be]/10 file:text-[#1e7ea1]"
              />
              <p className="text-[11px] text-gray-400 mt-1.5">
                {uploading === 'footer' ? 'Uploading…' : footerLogo}
              </p>
            </div>
          </div>

          {brandErr && (
            <p className="mt-4 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {brandErr}
            </p>
          )}
          {brandMsg && (
            <p className="mt-4 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
              {brandMsg}
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            <PrimaryButton
              onClick={handleSaveBranding}
              disabled={savingBrand || !!uploading}
            >
              {savingBrand ? 'Saving…' : 'Save Logos'}
            </PrimaryButton>
            <SecondaryButton
              onClick={() => {
                setHeaderLogo('/Website_logo_1.2-RB.png');
                setFooterLogo('/Website_logo_1.2-RB.png');
              }}
              disabled={savingBrand}
            >
              Reset defaults
            </SecondaryButton>
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-bold text-gray-900 mb-1">Blog listing</h2>
          <p className="text-xs text-gray-500 mb-5">
            How many published posts to show per page on /blog (phone, tablet, and desktop).
          </p>
          <div>
            <FieldLabel>Posts per page</FieldLabel>
            <TextInput
              value={blogPostsPerPage}
              onChange={setBlogPostsPerPage}
              placeholder="9"
            />
            <p className="text-[11px] text-gray-400 mt-1.5">Allowed range: 3–48. Default is 9.</p>
          </div>
          {blogErr && (
            <p className="mt-4 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {blogErr}
            </p>
          )}
          {blogMsg && (
            <p className="mt-4 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
              {blogMsg}
            </p>
          )}
          <div className="mt-5">
            <PrimaryButton onClick={handleSaveBlog} disabled={savingBlog}>
              {savingBlog ? 'Saving…' : 'Save Blog Settings'}
            </PrimaryButton>
          </div>
        </Card>
      </div>
    </div>
  );
}
