import { Metadata } from 'next';
import { QueueDashboard } from '@/components/admin/QueueDashboard';

export const metadata: Metadata = {
  title: 'Queue Dashboard',
  description: 'Monitor and manage background tasks',
};

export default function QueueDashboardPage() {
  return (
    <div className="flex-1 flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Queue Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and manage background tasks
          </p>
        </div>
      </div>
      <QueueDashboard />
    </div>
  );
} 