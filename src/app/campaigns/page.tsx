import { getCampaigns } from '@/lib/data-services';
import CampaignGrid from '@/components/CampaignGrid';
import { Suspense } from 'react';
import CampaignGridSkeleton from '@/components/CampaignGridSkeleton';

export default async function CampaignsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
        <p className="text-gray-600 mt-2">
          Manage and monitor all your advertising campaigns
        </p>
      </div>

      <Suspense fallback={<CampaignGridSkeleton />}>
        <CampaignGridWrapper />
      </Suspense>
    </div>
  );
}

async function CampaignGridWrapper() {
  const campaigns = await getCampaigns();

  return <CampaignGrid campaigns={campaigns} />;
}
