'use client';

import { ModernNavigation } from '@/components/layout/ModernNavigation';
import { useRequireAuth } from '@/lib/auth/user-context';
import { KnowledgeBaseManager } from '@/components/dashboard/KnowledgeBaseManager';

export default function KnowledgeBasePage() {
  const { loading, user } = useRequireAuth();
  
  if (loading) {
    return (
      <ModernNavigation>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      </ModernNavigation>
    );
  }

  if (!user?.id) {
    return (
      <ModernNavigation>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
            <p className="text-gray-600">Please log in to access the knowledge base.</p>
          </div>
        </div>
      </ModernNavigation>
    );
  }

  return (
    <ModernNavigation>
      <KnowledgeBaseManager userId={user.id} />
    </ModernNavigation>
  );
}