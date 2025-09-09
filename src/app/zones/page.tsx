import { getZones } from '@/lib/data-services';
import ZoneGrid from '@/components/ZoneGrid';
import { Suspense } from 'react';
import ZoneGridSkeleton from '@/components/ZoneGridSkeleton';

export default async function ZonesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Zones</h1>
        <p className="text-gray-600 mt-2">
          Manage and monitor all your advertising zones
        </p>
      </div>

      <Suspense fallback={<ZoneGridSkeleton />}>
        <ZoneGridWrapper />
      </Suspense>
    </div>
  );
}

async function ZoneGridWrapper() {
  const zones = await getZones();

  return <ZoneGrid zones={zones} />;
}


