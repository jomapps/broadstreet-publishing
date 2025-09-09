'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Campaign } from '@/types/campaign';

interface CampaignListProps {
  onCampaignSelect?: (campaign: Campaign) => void;
}

const CampaignList: React.FC<CampaignListProps> = ({ onCampaignSelect }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/campaigns');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch campaigns');
      }
      
      const data = await response.json();
      setCampaigns(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading campaigns...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-red-800 font-medium">Error loading campaigns</span>
        </div>
        <p className="text-red-600 mt-1">{error}</p>
        <button
          onClick={fetchCampaigns}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="text-center p-8">
        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
        <p className="text-gray-600">You don&apos;t have any campaigns yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Your Campaigns</h2>
        <button
          onClick={fetchCampaigns}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>
      
      <div className="grid gap-4">
        {campaigns.map((campaign) => (
          <div
            key={campaign.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onCampaignSelect?.(campaign)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Link href={`/campaigns/${campaign.id}`} className="block">
                  <h3 className="text-lg font-medium text-gray-900 hover:text-blue-600">
                    {campaign.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">ID: {campaign.id}</p>
                  {campaign.startDate && (
                    <p className="text-sm text-gray-500 mt-1">
                      Started: {new Date(campaign.startDate).toLocaleDateString()}
                    </p>
                  )}
                </Link>
              </div>
              <div className="ml-4">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                  {campaign.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CampaignList;
