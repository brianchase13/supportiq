'use client';

import { UserProfileManager } from '@/components/profile/UserProfileManager';
import { useRequireAuth } from '@/lib/auth/user-context';

export default function ProfilePage() {
  const { loading } = useRequireAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <UserProfileManager />;
}