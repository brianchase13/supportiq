import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Dynamic imports for heavy components
const DeflectionDashboard = dynamic(
  () => import('./DeflectionDashboard').then(mod => ({ default: mod.DeflectionDashboard })),
  {
    loading: () => <DashboardSkeleton />,
    ssr: false,
  }
);

const AgentPerformanceScorecard = dynamic(
  () => import('./AgentPerformanceScorecard').then(mod => ({ default: mod.AgentPerformanceScorecard })),
  {
    loading: () => <ScorecardSkeleton />,
    ssr: false,
  }
);

const CrisisModeAlert = dynamic(
  () => import('./CrisisModeAlert').then(mod => ({ default: mod.CrisisModeAlert })),
  {
    loading: () => <AlertSkeleton />,
    ssr: false,
  }
);

const AnalyticsDashboard = dynamic(
  () => import('./RealTimeAnalytics'),
  {
    loading: () => <AnalyticsSkeleton />,
    ssr: false,
  }
);

const KnowledgeBaseManager = dynamic(
  () => import('./KnowledgeBaseManager').then(mod => ({ default: mod.KnowledgeBaseManager })),
  {
    loading: () => <KBSkeleton />,
    ssr: false,
  }
);

const SettingsPanel = dynamic(
  () => import('./RealTimeDashboard').then(mod => ({ default: mod.RealTimeDashboard })),
  {
    loading: () => <SettingsSkeleton />,
    ssr: false,
  }
);

// Loading skeletons
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

const ScorecardSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-48 bg-gray-200 rounded-lg"></div>
  </div>
);

const AlertSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-16 bg-gray-200 rounded-lg"></div>
  </div>
);

const AnalyticsSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-96 bg-gray-200 rounded-lg"></div>
  </div>
);

const KBSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-64 bg-gray-200 rounded-lg"></div>
  </div>
);

const SettingsSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-80 bg-gray-200 rounded-lg"></div>
  </div>
);

// Generic loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    <span className="ml-2 text-gray-600">Loading...</span>
  </div>
);

interface DynamicDashboardProps {
  activeTab: string;
  userData?: any;
}

export function DynamicDashboard({ activeTab, userData }: DynamicDashboardProps) {
  const renderComponent = () => {
    switch (activeTab) {
      case 'deflection':
        return (
          <Suspense fallback={<DashboardSkeleton />}>
            <DeflectionDashboard userId={userData?.id || 'default'} />
          </Suspense>
        );
      case 'performance':
        return (
          <Suspense fallback={<ScorecardSkeleton />}>
            <AgentPerformanceScorecard />
          </Suspense>
        );
      case 'crisis':
        return (
          <Suspense fallback={<AlertSkeleton />}>
            <CrisisModeAlert />
          </Suspense>
        );
      case 'analytics':
        return (
          <Suspense fallback={<AnalyticsSkeleton />}>
            <AnalyticsDashboard />
          </Suspense>
        );
      case 'knowledge':
        return (
          <Suspense fallback={<KBSkeleton />}>
            <KnowledgeBaseManager userId={userData?.id || 'default'} />
          </Suspense>
        );
      case 'settings':
        return (
          <Suspense fallback={<SettingsSkeleton />}>
            <SettingsPanel userId={userData?.id || 'default'} />
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