'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import TicketDeflectionDashboard from '@/components/dashboard/TicketDeflectionDashboard';

export default function DeflectionPage() {
  return (
    <DashboardLayout>
      <TicketDeflectionDashboard />
    </DashboardLayout>
  );
} 