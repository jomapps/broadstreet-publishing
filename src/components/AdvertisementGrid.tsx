'use client';

import { Advertisement } from '@/types/campaign';
import { useState } from 'react';

interface AdvertisementGridProps {
  advertisements: Advertisement[];
}

const AdvertisementGrid: React.FC<AdvertisementGridProps> = ({ advertisements }) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Trigger a page refresh to refetch server data
    window.location.reload();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'banner':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'video':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case 'text':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V7H3a1 1 0 01-1-1V5a1 1 0 011-1h4z" />
          </svg>
        );
    }
  };

  if (advertisements.length === 0) {
    return (
      <div className="text-center p-12">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 className="text-xl font-medium text-gray-900 mb-2">No advertisements found</h3>
        <p className="text-gray-600 mb-6">You don&apos;t have any advertisements yet. Create your first advertisement to get started.</p>
        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
          Create Advertisement
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Your Advertisements</h2>
          <p className="text-sm text-gray-600 mt-1">{advertisements.length} advertisement{advertisements.length !== 1 ? 's' : ''} found</p>
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {advertisements.map((ad) => (
          <div
            key={ad.id}
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="text-gray-400">
                  {getTypeIcon(ad.type)}
                </div>
                <h3 className="text-lg font-medium text-gray-900 truncate">
                  {ad.name}
                </h3>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {ad.type}
                </span>
              </div>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  ad.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {ad.status}
              </span>
            </div>

            {/* Details */}
            <div className="space-y-2 mb-4">
              <p className="text-sm text-gray-600">ID: {ad.id}</p>
              <p className="text-sm text-gray-500">Campaign ID: {ad.campaignId}</p>
              <p className="text-sm text-gray-500">Advertiser ID: {ad.advertiserId}</p>
              {ad.width && ad.height && (
                <p className="text-sm text-gray-500">
                  Dimensions: {ad.width} × {ad.height}
                </p>
              )}
              {ad.createdAt && (
                <p className="text-sm text-gray-500">
                  Created: {new Date(ad.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>

            {/* Action */}
            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                View Details
                <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Advertisement Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{advertisements.length}</p>
            <p className="text-sm text-gray-600">Total Ads</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {advertisements.filter(a => a.status === 'active').length}
            </p>
            <p className="text-sm text-gray-600">Active</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {advertisements.filter(a => a.type === 'banner').length}
            </p>
            <p className="text-sm text-gray-600">Banners</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-indigo-600">
              {advertisements.filter(a => a.type === 'video').length}
            </p>
            <p className="text-sm text-gray-600">Videos</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvertisementGrid;
