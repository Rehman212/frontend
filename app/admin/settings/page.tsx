'use client';

import { useAuth } from '../../context/AuthContext';
import { Card, FieldLabel, PageHeader } from '../components/AdminUi';

export default function SettingsPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Your account information for the CMS dashboard."
      />

      <div className="max-w-lg">
        <Card>
          <h2 className="text-sm font-bold text-gray-900 mb-4">Account</h2>
          <div className="space-y-4">
            <div>
              <FieldLabel>Username</FieldLabel>
              <p className="text-sm text-gray-900 px-3.5 py-2.5 rounded-lg bg-gray-50 border border-gray-200">
                {user.username}
              </p>
            </div>
            <div>
              <FieldLabel>Email</FieldLabel>
              <p className="text-sm text-gray-900 px-3.5 py-2.5 rounded-lg bg-gray-50 border border-gray-200">
                {user.email}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
