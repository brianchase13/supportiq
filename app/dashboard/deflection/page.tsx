'use client';

import { ModernNavigation } from '@/components/layout/ModernNavigation';
import { useRequireAuth } from '@/lib/auth/user-context';
import TicketDeflectionDashboard from '@/components/dashboard/TicketDeflectionDashboard';

export default function DeflectionPage() {
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
      <TicketDeflectionDashboard />
    </ModernNavigation>
  );
}