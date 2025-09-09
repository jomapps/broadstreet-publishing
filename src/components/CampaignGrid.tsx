'use client';

import Link from 'next/link';
import { Campaign } from '@/types/campaign';
import { useState } from 'react';

interface CampaignGridProps {
  campaigns: Campaign[];
}

const CampaignGrid: React.FC<CampaignGridProps> = ({ campaigns }) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Trigger a page refresh to refetch server data
    window.location.reload();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatNumber = (num: number | undefined) => {
    if (num === undefined || num === null) return '0';
    return new Intl.NumberFormat().format(num);
  };

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined || amount === null) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (campaigns.length === 0) {
    return (
      <div className="text-center p-12">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 className="text-xl font-medium text-gray-900 mb-2">No campaigns found</h3>
        <p className="text-gray-600 mb-6">You don&apos;t have any campaigns yet. Create your first campaign to get started.</p>
        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
          Create Campaign
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Your Campaigns</h2>
          <p className="text-sm text-gray-600 mt-1">{campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''} found</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
        >
          <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {campaigns.map((campaign) => (
          <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-200 cursor-pointer group">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                    {campaign.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">ID: {campaign.id}</p>
                </div>
                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(campaign.status)}`}>
                  {campaign.status}
                </span>
              </div>

              {/* Dates */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Start: {formatDate(campaign.startDate)}</span>
                </div>
                {campaign.endDate && (
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>End: {formatDate(campaign.endDate)}</span>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Budget</p>
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(campaign.budget)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Spent</p>
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(campaign.spent)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Impressions</p>
                  <p className="text-sm font-semibold text-gray-900">{formatNumber(campaign.impressions)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">CTR</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {campaign.ctr ? `${(campaign.ctr * 100).toFixed(2)}%` : '0.00%'}
                  </p>
                </div>
              </div>

              {/* Action indicator */}
              <div className="flex items-center justify-end mt-4 pt-4 border-t border-gray-100">
                <span className="text-xs text-blue-600 group-hover:text-blue-700 font-medium flex items-center">
                  View Details
                  <svg className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Campaign Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{campaigns.length}</p>
            <p className="text-sm text-gray-600">Total Campaigns</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {campaigns.filter(c => c.status === 'active').length}
            </p>
            <p className="text-sm text-gray-600">Active</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {campaigns.filter(c => c.status === 'paused').length}
            </p>
            <p className="text-sm text-gray-600">Paused</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {formatCurrency(campaigns.reduce((sum, c) => sum + (c.spent || 0), 0))}
            </p>
            <p className="text-sm text-gray-600">Total Spent</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignGrid;
