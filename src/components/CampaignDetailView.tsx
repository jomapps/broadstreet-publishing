'use client';

import { CampaignData } from '@/types/campaign';
import { useState } from 'react';

interface CampaignDetailViewProps {
  campaignData: CampaignData;
}

const CampaignDetailView: React.FC<CampaignDetailViewProps> = ({ campaignData }) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Trigger a page refresh to refetch server data
    window.location.reload();
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (rate: number) => {
    return `${(rate * 100).toFixed(2)}%`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Campaign #{campaignData.campaignId} Performance
        </h2>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
        >
          <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
        </button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Impressions</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(campaignData.impressions)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Clicks</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(campaignData.clicks)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">CTR</p>
              <p className="text-2xl font-bold text-gray-900">{formatPercentage(campaignData.ctr)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Spend</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(campaignData.spend)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Campaign Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Campaign ID:</span>
              <span className="font-medium">{campaignData.campaignId}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Total Impressions:</span>
              <span className="font-medium">{formatNumber(campaignData.impressions)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Total Clicks:</span>
              <span className="font-medium">{formatNumber(campaignData.clicks)}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Click-Through Rate:</span>
              <span className="font-medium">{formatPercentage(campaignData.ctr)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Total Spend:</span>
              <span className="font-medium">{formatCurrency(campaignData.spend)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Cost Per Click:</span>
              <span className="font-medium">
                {campaignData.clicks > 0 
                  ? formatCurrency(campaignData.spend / campaignData.clicks)
                  : '$0.00'
                }
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Insights</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className={`w-2 h-2 rounded-full mt-2 ${
                campaignData.ctr > 0.02 ? 'bg-green-400' : campaignData.ctr > 0.01 ? 'bg-yellow-400' : 'bg-red-400'
              }`}></div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Click-Through Rate</p>
              <p className="text-sm text-gray-600">
                {campaignData.ctr > 0.02 
                  ? 'Excellent CTR! Your campaign is performing above industry average.'
                  : campaignData.ctr > 0.01 
                  ? 'Good CTR. Consider optimizing ad creative for better performance.'
                  : 'CTR is below average. Review targeting and ad creative.'
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className={`w-2 h-2 rounded-full mt-2 ${
                campaignData.impressions > 10000 ? 'bg-green-400' : campaignData.impressions > 1000 ? 'bg-yellow-400' : 'bg-red-400'
              }`}></div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Reach</p>
              <p className="text-sm text-gray-600">
                {campaignData.impressions > 10000 
                  ? 'Great reach! Your campaign is getting good visibility.'
                  : campaignData.impressions > 1000 
                  ? 'Moderate reach. Consider increasing budget for more visibility.'
                  : 'Low reach. Review targeting settings and budget allocation.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetailView;
