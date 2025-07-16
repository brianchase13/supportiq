import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Dynamic imports for admin components
const LaunchChecklist = dynamic(
  () => import('./LaunchChecklist').then(mod => ({ default: mod.LaunchChecklist })),
  {
    loading: () => <ChecklistSkeleton />,
    ssr: false,
  }
);

const BetaRecruitmentDashboard = dynamic(
  () => import('../beta/BetaRecruitmentDashboard').then(mod => ({ default: mod.BetaRecruitmentDashboard })),
  {
    loading: () => <BetaSkeleton />,
    ssr: false,
  }
);

const AnalyticsDashboard = dynamic(
  () => import('../analytics/ResultsTrackingDashboard').then(mod => ({ default: mod.ResultsTrackingDashboard })),
  {
    loading: () => <AnalyticsSkeleton />,
    ssr: false,
  }
);

// Loading skeletons
const ChecklistSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-gray-200 rounded mb-4"></div>
    <div className="space-y-3">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="h-6 bg-gray-200 rounded"></div>
      ))}
    </div>
  </div>
);

const BetaSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-64 bg-gray-200 rounded-lg mb-4"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="h-32 bg-gray-200 rounded-lg"></div>
      <div className="h-32 bg-gray-200 rounded-lg"></div>
    </div>
  </div>
);

const AnalyticsSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-96 bg-gray-200 rounded-lg"></div>
  </div>
);

// Generic loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    <span className="ml-2 text-gray-600">Loading admin components...</span>
  </div>
);

interface DynamicAdminComponentsProps {
  component: 'checklist' | 'beta' | 'analytics';
  props?: any;
}

export function DynamicAdminComponents({ component, props }: DynamicAdminComponentsProps) {
  const renderComponent = () => {
    switch (component) {
      case 'checklist':
        return (
          <Suspense fallback={<ChecklistSkeleton />}>
            <LaunchChecklist {...props} />
          </Suspense>
        );
      case 'beta':
        return (
          <Suspense fallback={<BetaSkeleton />}>
            <BetaRecruitmentDashboard {...props} />
          </Suspense>
        );
      case 'analytics':
        return (
          <Suspense fallback={<AnalyticsSkeleton />}>
            <AnalyticsDashboard {...props} />
          </Suspense>
        );
      default:
        return <LoadingSpinner />;
    }
  };

  return (
    <div className="w-full">
      {renderComponent()}
    </div>
  );
} 