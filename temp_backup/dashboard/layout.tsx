import { Sidebar } from '@/components/layout/Sidebar';
import { DemoModeBadge } from '@/components/ui/DemoModeBadge';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
      <DemoModeBadge />
    </div>
  );
}