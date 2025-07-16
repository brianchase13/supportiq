import React, { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Generic loading component
const LoadingSpinner = ({ size = 'default' }: { size?: 'small' | 'default' | 'large' }) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    default: 'h-8 w-8',
    large: 'h-12 w-12'
  };
  
  return (
    <div className="flex items-center justify-center p-4">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600`} />
    </div>
  );
};

// Lazy load heavy UI components
export const LazyCard = lazy(() => import('@/components/ui/card').then(mod => ({ default: mod.Card })));
export const LazyButton = lazy(() => import('@/components/ui/button').then(mod => ({ default: mod.Button })));
export const LazyDialog = lazy(() => import('@/components/ui/dialog').then(mod => ({ default: mod.Dialog })));
export const LazySelect = lazy(() => import('@/components/ui/select').then(mod => ({ default: mod.Select })));
export const LazyTabs = lazy(() => import('@/components/ui/tabs').then(mod => ({ default: mod.Tabs })));
export const LazyToast = lazy(() => import('@/components/ui/toast').then(mod => ({ default: mod.Toast })));

// Lazy load dashboard components
export const LazyDeflectionDashboard = lazy(() => 
  import('@/components/dashboard/DeflectionDashboard').then(mod => ({ default: mod.DeflectionDashboard }))
);

export const LazyAgentPerformanceScorecard = lazy(() => 
  import('@/components/dashboard/AgentPerformanceScorecard').then(mod => ({ default: mod.AgentPerformanceScorecard }))
);

export const LazyCrisisModeAlert = lazy(() => 
  import('@/components/dashboard/CrisisModeAlert').then(mod => ({ default: mod.CrisisModeAlert }))
);

// Lazy load AI components
export const LazyTicketTester = lazy(() => 
  import('@/components/ai/TicketTester').then(mod => ({ default: mod.TicketTester }))
);

export const LazyFAQGenerator = lazy(() => 
  import('@/components/ai/FAQGenerator').then(mod => ({ default: mod.FAQGenerator }))
);

// Lazy load admin components
export const LazyLaunchChecklist = lazy(() => 
  import('@/components/admin/LaunchChecklist').then(mod => ({ default: mod.LaunchChecklist }))
);

export const LazyBetaRecruitmentDashboard = lazy(() => 
  import('@/components/beta/BetaRecruitmentDashboard').then(mod => ({ default: mod.BetaRecruitmentDashboard }))
);

// Lazy load analytics components
export const LazyResultsTrackingDashboard = lazy(() => 
  import('@/components/analytics/ResultsTrackingDashboard').then(mod => ({ default: mod.ResultsTrackingDashboard }))
);

// Lazy load billing components
export const LazyAutumnCheckout = lazy(() => 
  import('@/components/billing/AutumnCheckout').then(mod => ({ default: mod.AutumnCheckout }))
);

export const LazyBillingManagement = lazy(() => 
  import('@/components/billing/BillingManagement').then(mod => ({ default: mod.BillingManagement }))
);

// Lazy load intercom components
export const LazyIntercomConnect = lazy(() => 
  import('@/components/intercom/IntercomConnect').then(mod => ({ default: mod.IntercomConnect }))
);

export const LazyTicketAnalyzer = lazy(() => 
  import('@/components/intercom/TicketAnalyzer').then(mod => ({ default: mod.TicketAnalyzer }))
);

// Lazy load demo components
export const LazyBookDemo = lazy(() => 
  import('@/components/demo/BookDemo').then(mod => ({ default: mod.BookDemo }))
);

export const LazyDemoMode = lazy(() => 
  import('@/components/demo/DemoMode').then(mod => ({ default: mod.DemoMode }))
);

// Lazy load settings components
export const LazyDeflectionSettings = lazy(() => 
  import('@/components/settings/DeflectionSettings').then(mod => ({ default: mod.DeflectionSettings }))
);

export const LazyTeamManagement = lazy(() => 
  import('@/components/settings/TeamManagement').then(mod => ({ default: mod.TeamManagement }))
);

// Lazy load profile components
export const LazyUserProfileManager = lazy(() => 
  import('@/components/profile/UserProfileManager').then(mod => ({ default: mod.UserProfileManager }))
);

// Lazy load trial components
export const LazyTrialStatus = lazy(() => 
  import('@/components/trial/TrialStatus').then(mod => ({ default: mod.TrialStatus }))
);

// Lazy load upload components
export const LazyCSVUpload = lazy(() => 
  import('@/components/upload/CSVUpload').then(mod => ({ default: mod.CSVUpload }))
);

// Lazy load experts components
export const LazyROICalculator = lazy(() => 
  import('@/components/experts/ROICalculator').then(mod => ({ default: mod.ROICalculator }))
);

// Lazy load pricing components
export const LazyOptimizedPricing = lazy(() => 
  import('@/components/pricing/OptimizedPricing').then(mod => ({ default: mod.OptimizedPricing }))
);

// Lazy load landing components
export const LazyEmailCapture = lazy(() => 
  import('@/components/landing/EmailCapture').then(mod => ({ default: mod.EmailCapture }))
);

// Lazy load layout components
export const LazyDashboardLayout = lazy(() => 
  import('@/components/layout/DashboardLayout').then(mod => ({ default: mod.DashboardLayout }))
);

export const LazyModernNavigation = lazy(() => 
  import('@/components/layout/ModernNavigation').then(mod => ({ default: mod.ModernNavigation }))
);

export const LazySidebar = lazy(() => 
  import('@/components/layout/Sidebar').then(mod => ({ default: mod.Sidebar }))
);

// Lazy load onboarding components
export const LazyOnboardingWizard = lazy(() => 
  import('@/components/onboarding/OnboardingWizard').then(mod => ({ default: mod.OnboardingWizard }))
);

// Wrapper component for lazy loading with error boundary
export function LazyComponent({ 
  component: Component, 
  fallback = <LoadingSpinner />,
  errorFallback = <div className="p-4 text-red-600">Failed to load component</div>,
  ...props 
}: {
  component: React.ComponentType<any>;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  [key: string]: any;
}) {
  return (
    <Suspense fallback={fallback}>
      <ErrorBoundary fallback={errorFallback}>
        <Component {...props} />
      </ErrorBoundary>
    </Suspense>
  );
}

// Simple error boundary
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// Preload function for critical components
export function preloadComponent(component: () => Promise<any>) {
  return () => {
    component();
    return null;
  };
}

// Preload critical components
export const PreloadCritical = () => {
  React.useEffect(() => {
    // Preload critical components
    LazyCard();
    LazyButton();
    LazyDashboardLayout();
  }, []);
  
  return null;
}; 