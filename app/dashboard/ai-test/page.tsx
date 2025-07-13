'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TicketTester } from '@/components/ai/TicketTester';
import { useRequireAuth } from '@/lib/auth/user-context';
import { Loader2 } from 'lucide-react';

export default function AITestPage() {
  const { user, loading } = useRequireAuth();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-slate-400">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-slate-400 mb-4">Please sign in to access AI testing</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-3">AI Ticket Testing</h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Test our AI-powered ticket processing with sample tickets or create your own scenarios.
          </p>
        </div>

        <TicketTester />
      </div>
    </DashboardLayout>
  );
} 