import Link from 'next/link';
import { getCampaignData } from '@/lib/data-services';
import CampaignDetailView from '@/components/CampaignDetailView';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';

interface CampaignPageProps {
  params: {
    id: string;
  };
}

export default async function CampaignPage({ params }: CampaignPageProps) {
  const campaignId = parseInt(params.id, 10);

  if (isNaN(campaignId)) {
    return (
      <div className="space-y-8">
        <div className="flex items-center space-x-4">
          <Link
            href="/campaigns"
            className="text-blue-600 hover:text-blue-800 flex items-center"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Campaigns
          </Link>
        </div>
        
        <div className="text-center p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-red-800 mb-2">Invalid Campaign ID</h3>
            <p className="text-red-600">The campaign ID provided is not valid.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-4">
        <Link
          href="/campaigns"
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Campaigns
        </Link>
      </div>

      <Suspense fallback={<CampaignDetailSkeleton />}>
        <CampaignDetailWrapper campaignId={campaignId} />
      </Suspense>
    </div>
  );
}

async function CampaignDetailWrapper({ campaignId }: { campaignId: number }) {
  const campaignData = await getCampaignData(campaignId);

  if (!campaignData) {
    notFound();
  }

  return <CampaignDetailView campaignData={campaignData} />;
}

function CampaignDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-8 bg-gray-200 rounded w-64"></div>
        <div className="h-10 bg-gray-200 rounded w-32"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex justify-between">
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
