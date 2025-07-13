'use client';

import { ResultsTrackingDashboard } from '@/components/analytics/ResultsTrackingDashboard';
import { useRequireAuth } from '@/lib/auth/user-context';

export default function ResultsTrackingPage() {
  const { loading } = useRequireAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ResultsTrackingDashboard />
    </div>
  );
}