import { getAdvertisements } from '@/lib/data-services';
import AdvertisementGrid from '@/components/AdvertisementGrid';
import { Suspense } from 'react';
import AdvertisementGridSkeleton from '@/components/AdvertisementGridSkeleton';

export default async function AdvertisementsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Advertisements</h1>
        <p className="text-gray-600 mt-2">
          Manage and monitor all your advertisements
        </p>
      </div>

      <Suspense fallback={<AdvertisementGridSkeleton />}>
        <AdvertisementGridWrapper />
      </Suspense>
    </div>
  );
}

async function AdvertisementGridWrapper() {
  const advertisements = await getAdvertisements();

  return <AdvertisementGrid advertisements={advertisements} />;
}


