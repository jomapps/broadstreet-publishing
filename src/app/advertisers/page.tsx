import { getAdvertisers } from '@/lib/data-services';
import AdvertiserGrid from '@/components/AdvertiserGrid';
import { Suspense } from 'react';
import AdvertiserGridSkeleton from '@/components/AdvertiserGridSkeleton';

export default async function AdvertisersPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Advertisers</h1>
        <p className="text-gray-600 mt-2">
          Manage and monitor all your advertisers
        </p>
      </div>

      <Suspense fallback={<AdvertiserGridSkeleton />}>
        <AdvertiserGridWrapper />
      </Suspense>
    </div>
  );
}

async function AdvertiserGridWrapper() {
  const advertisers = await getAdvertisers();

  return <AdvertiserGrid advertisers={advertisers} />;
}


