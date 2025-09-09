'use client';

import { Advertiser } from '@/types/campaign';

interface AdvertiserGridProps {
  advertisers: Advertiser[];
}

export default function AdvertiserGrid({ advertisers }: AdvertiserGridProps) {
  if (advertisers.length === 0) {
    return (
      <div className="text-center p-8">
        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No advertisers found</h3>
        <p className="text-gray-600">
          No advertisers are currently available
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {advertisers.map((advertiser) => (
          <div
            key={advertiser.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">
                  {advertiser.name}
                </h3>
                <p className="text-sm text-gray-600 mt-1">ID: {advertiser.id}</p>
                {advertiser.email && (
                  <p className="text-sm text-gray-500 mt-1">
                    Email: {advertiser.email}
                  </p>
                )}
                {advertiser.phone && (
                  <p className="text-sm text-gray-500 mt-1">
                    Phone: {advertiser.phone}
                  </p>
                )}
                {advertiser.createdAt && (
                  <p className="text-sm text-gray-500 mt-1">
                    Created: {new Date(advertiser.createdAt).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    advertiser.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {advertiser.status}
                </span>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{advertisers.length}</p>
            <p className="text-sm text-gray-600">Total Advertisers</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {advertisers.filter(a => a.status === 'active').length}
            </p>
            <p className="text-sm text-gray-600">Active</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-600">
              {advertisers.filter(a => a.status === 'paused').length}
            </p>
            <p className="text-sm text-gray-600">Paused</p>
          </div>
        </div>
      </div>
    </div>
  );
}
