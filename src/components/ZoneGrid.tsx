'use client';

import { Zone } from '@/types/campaign';

interface ZoneGridProps {
  zones: Zone[];
}

export default function ZoneGrid({ zones }: ZoneGridProps) {
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
    }
  };

  if (zones.length === 0) {
    return (
      <div className="text-center p-8">
        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No zones found</h3>
        <p className="text-gray-600">
          No advertising zones are currently available
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {zones.map((zone) => (
          <div
            key={zone.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="text-gray-400">
                    {getTypeIcon(zone.type)}
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {zone.name}
                  </h3>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {zone.type}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">ID: {zone.id}</p>
                {zone.description && (
                  <p className="text-sm text-gray-500 mt-1">
                    Description: {zone.description}
                  </p>
                )}
                {zone.width && zone.height && (
                  <p className="text-sm text-gray-500 mt-1">
                    Dimensions: {zone.width} × {zone.height}
                  </p>
                )}
                {zone.createdAt && (
                  <p className="text-sm text-gray-500 mt-1">
                    Created: {new Date(zone.createdAt).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    zone.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {zone.status}
                </span>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Manage Zone
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{zones.length}</p>
            <p className="text-sm text-gray-600">Total Zones</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {zones.filter(z => z.status === 'active').length}
            </p>
            <p className="text-sm text-gray-600">Active</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {zones.filter(z => z.type === 'banner').length}
            </p>
            <p className="text-sm text-gray-600">Banner Zones</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-indigo-600">
              {zones.filter(z => z.type === 'video').length}
            </p>
            <p className="text-sm text-gray-600">Video Zones</p>
          </div>
        </div>
      </div>
    </div>
  );
}
