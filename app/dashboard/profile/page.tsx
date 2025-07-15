'use client';

import { ModernNavigation } from '@/components/layout/ModernNavigation';
import { useRequireAuth } from '@/lib/auth/user-context';
import { UserProfile } from '@/components/settings/UserProfile';

export default function ProfilePage() {
  const { loading } = useRequireAuth();
  
  if (loading) {
    return (
      <ModernNavigation>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      </ModernNavigation>
    );
  }

  return (
    <ModernNavigation>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>
        <UserProfile />
      </div>
    </ModernNavigation>
  );
}