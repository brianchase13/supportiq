import { ModernNavigation } from '@/components/layout/ModernNavigation';
import { DemoModeBadge } from '@/components/ui/DemoModeBadge';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ModernNavigation>
      {children}
      <DemoModeBadge />
    </ModernNavigation>
  );
}