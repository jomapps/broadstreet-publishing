'use client';

import React, { useState, useEffect, useCallback } from 'react';
import SummaryCard from './SummaryCard';
import ResyncButton from './ResyncButton';
import { DashboardSummary as DashboardSummaryType } from '@/types/campaign';
import { useNetwork } from '@/contexts/NetworkContext';

const DashboardSummary: React.FC = () => {
  const { selectedNetwork, initialized, loading: networkLoading } = useNetwork();
  const [summary, setSummary] = useState<DashboardSummaryType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    // Don't fetch if network context is not initialized yet
    if (!initialized) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const url = selectedNetwork
        ? `/api/dashboard/summary?network_id=${selectedNetwork.id}`
        : '/api/dashboard/summary';

      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch dashboard summary');
      }

      const summaryData = await response.json();
      setSummary(summaryData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching dashboard summary:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedNetwork, initialized]);

  // Handle manual resync
  const handleResync = useCallback(async () => {
    try {
      const response = await fetch('/api/sync/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          type: 'full',
          force: false
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Sync failed');
      }

      // Refresh dashboard data after successful sync
      setTimeout(() => {
        fetchSummary();
      }, 2000); // Wait 2 seconds for sync to complete

    } catch (error) {
      console.error('Manual resync failed:', error);
      throw error; // Re-throw to let ResyncButton handle the error display
    }
  }, [fetchSummary]);

  useEffect(() => {
    // Only fetch when network context is initialized
    if (initialized) {
      fetchSummary();
    }
  }, [selectedNetwork, initialized, fetchSummary]);

  // Show loading state while network context is initializing
  if (networkLoading || !initialized) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
          <div className="animate-pulse h-10 w-20 bg-gray-200 rounded"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <SummaryCard key={i} title="Loading..." value="..." loading={true} />
          ))}
        </div>
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
          <span className="text-red-800 font-medium">Error loading dashboard summary</span>
        </div>
        <p className="text-red-600 mt-1">{error}</p>
        <button
          onClick={fetchSummary}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const summaryCards = [
    {
      title: 'Networks',
      value: loading ? 'Loading...' : summary?.networks.total || 0,
      subtitle: `${summary?.networks.active || 0} active`,
      color: 'blue' as const,
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
        </svg>
      ),
    },
    {
      title: 'Advertisers',
      value: loading ? 'Loading...' : summary?.advertisers.total || 0,
      subtitle: `${summary?.advertisers.active || 0} active`,
      color: 'green' as const,
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      title: 'Campaigns',
      value: loading ? 'Loading...' : summary?.campaigns.total || 0,
      subtitle: `${summary?.campaigns.active || 0} active, ${summary?.campaigns.paused || 0} paused`,
      color: 'purple' as const,
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      title: 'Total Spend',
      value: loading ? 'Loading...' : `$${(summary?.campaigns.totalSpend || 0).toFixed(2)}`,
      subtitle: 'This month',
      color: 'yellow' as const,
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
    },
    {
      title: 'Advertisements',
      value: loading ? 'Loading...' : summary?.advertisements.total || 0,
      subtitle: `${summary?.advertisements.active || 0} active`,
      color: 'indigo' as const,
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: 'Zones',
      value: loading ? 'Loading...' : summary?.zones.total || 0,
      subtitle: `${summary?.zones.active || 0} active`,
      color: 'red' as const,
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Dashboard Overview
          {selectedNetwork && (
            <span className="text-lg font-normal text-gray-600 ml-2">
              - {selectedNetwork.name}
            </span>
          )}
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchSummary}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <ResyncButton
            onResync={handleResync}
            variant="outline"
            size="md"
            showLastSync={true}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {summaryCards.map((card, index) => (
          <SummaryCard
            key={index}
            title={card.title}
            value={card.value}
            subtitle={card.subtitle}
            color={card.color}
            icon={card.icon}
            loading={loading}
          />
        ))}
      </div>
      
      {summary && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Impressions</span>
                <span className="font-medium">
                  {(summary.campaigns.totalImpressions || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Clicks</span>
                <span className="font-medium">
                  {(summary.campaigns.totalClicks || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Average CTR</span>
                <span className="font-medium">
                  {summary.campaigns.totalImpressions > 0 
                    ? ((summary.campaigns.totalClicks / summary.campaigns.totalImpressions) * 100).toFixed(2)
                    : '0.00'
                  }%
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                Create New Campaign
              </button>
              <button className="w-full text-left px-4 py-2 text-green-600 hover:bg-green-50 rounded-md transition-colors">
                Add New Advertiser
              </button>
              <button className="w-full text-left px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-md transition-colors">
                Manage Zones
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardSummary;
