import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Dynamic import for TicketTester only
const TicketTester = dynamic(
  () => import('./TicketTester').then(mod => ({ default: mod.TicketTester })),
  {
    loading: () => <AISkeleton />,
    ssr: false,
  }
);

// Loading skeletons
const AISkeleton = () => (
  <div className="animate-pulse">
    <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
    <div className="h-48 bg-gray-200 rounded-lg"></div>
  </div>
);

// Generic loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    <span className="ml-2 text-gray-600">Loading AI components...</span>
  </div>
);

interface DynamicAIComponentsProps {
  component: 'tester';
  props?: any;
}

export function DynamicAIComponents({ component, props }: DynamicAIComponentsProps) {
  const renderComponent = () => {
    switch (component) {
      case 'tester':
        return (
          <Suspense fallback={<AISkeleton />}>
            <TicketTester {...props} />
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