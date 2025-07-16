'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Dynamic imports for heavy dashboard components
const DashboardLayout = dynamic(
  () => import('@/components/layout/DashboardLayout').then(mod => ({ default: mod.DashboardLayout })),
  {
    loading: () => <LayoutSkeleton />,
    ssr: true,
  }
);

const DynamicDashboard = dynamic(
  () => import('@/components/dashboard/DynamicDashboard').then(mod => ({ default: mod.DynamicDashboard })),
  {
    loading: () => <DashboardSkeleton />,
    ssr: false,
  }
);

// Loading skeletons
const LayoutSkeleton = () => (
  <div className="min-h-screen bg-gray-50 animate-pulse">
    <div className="h-16 bg-white border-b"></div>
    <div className="flex">
      <div className="w-64 h-screen bg-white border-r"></div>
      <div className="flex-1 p-6">
        <div className="h-8 bg-gray-200 rounded mb-4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    </div>
  </div>
);

const DashboardSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-64 bg-gray-200 rounded-lg mb-4"></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="h-32 bg-gray-200 rounded-lg"></div>
      <div className="h-32 bg-gray-200 rounded-lg"></div>
      <div className="h-32 bg-gray-200 rounded-lg"></div>
    </div>
  </div>
);

// Generic loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
      <p className="text-gray-600">Loading your dashboard...</p>
    </div>
  </div>
);

export default function DashboardPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <DashboardLayout>
        <DynamicDashboard activeTab="deflection" />
      </DashboardLayout>
    </Suspense>
  );
}