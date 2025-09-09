import { getDashboardSummary, getNetworks } from '@/lib/data-services';
import DashboardSummaryView from '@/components/DashboardSummaryView';
import { Suspense } from 'react';
import DashboardSkeleton from '@/components/DashboardSkeleton';

export default async function Home() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome to your Broadstreet campaign management dashboard
        </p>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardWrapper />
      </Suspense>
    </div>
  );
}

async function DashboardWrapper() {
  const [summary, networks] = await Promise.all([
    getDashboardSummary(),
    getNetworks()
  ]);

  return <DashboardSummaryView summary={summary} networks={networks} />;
}
