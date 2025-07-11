'use client';

import { useUser } from '@clerk/nextjs';
import { RealTimeDashboard } from '@/components/dashboard/RealTimeDashboard';
import { DashboardWithErrorBoundary } from '@/components/dashboard/ErrorBoundary';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Zap } from 'lucide-react';

export default function DashboardPage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-800 rounded w-1/3" />
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-slate-800 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please sign in to view your dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-400" />
            Real-Time Dashboard
          </h1>
          <p className="text-slate-400">Live analytics powered by AI insights</p>
        </div>
      </div>

      {/* Real-Time Dashboard with Error Boundary */}
      <DashboardWithErrorBoundary>
        <RealTimeDashboard userId={user.id} />
      </DashboardWithErrorBoundary>
    </div>
  );
}