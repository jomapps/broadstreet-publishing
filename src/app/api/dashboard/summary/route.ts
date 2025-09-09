import { NextRequest, NextResponse } from 'next/server';
import { DashboardSummary, Network, Advertiser, Campaign, Advertisement, Zone } from '@/types/campaign';

export async function GET(request: NextRequest) {
  try {
    const baseUrl = process.env.NODE_ENV === 'development'
      ? 'http://localhost:3005'
      : process.env.NEXT_PUBLIC_BASE_URL || 'https://character.ft.tc';

    // Fetch data from all endpoints in parallel
    const [networksRes, advertisersRes, campaignsRes, advertisementsRes, zonesRes] = await Promise.all([
      fetch(`${baseUrl}/api/networks`),
      fetch(`${baseUrl}/api/advertisers`),
      fetch(`${baseUrl}/api/campaigns`),
      fetch(`${baseUrl}/api/advertisements`),
      fetch(`${baseUrl}/api/zones`),
    ]);

    // Parse responses
    const networks: Network[] = networksRes.ok ? await networksRes.json() : [];
    const advertisers: Advertiser[] = advertisersRes.ok ? await advertisersRes.json() : [];
    const campaigns: Campaign[] = campaignsRes.ok ? await campaignsRes.json() : [];
    const advertisements: Advertisement[] = advertisementsRes.ok ? await advertisementsRes.json() : [];
    const zones: Zone[] = zonesRes.ok ? await zonesRes.json() : [];

    // Filter campaigns by network if specified
    const filteredCampaigns = campaigns;

    // Calculate summary statistics
    const summary: DashboardSummary = {
      networks: {
        total: networks.length,
        active: networks.filter(n => n.status === 'active').length,
      },
      advertisers: {
        total: advertisers.length,
        active: advertisers.filter(a => a.status === 'active').length,
      },
      campaigns: {
        total: filteredCampaigns.length,
        active: filteredCampaigns.filter(c => c.status === 'active').length,
        paused: filteredCampaigns.filter(c => c.status === 'paused').length,
        totalSpend: filteredCampaigns.reduce((sum, c) => sum + (c.spent || 0), 0),
        totalImpressions: filteredCampaigns.reduce((sum, c) => sum + (c.impressions || 0), 0),
        totalClicks: filteredCampaigns.reduce((sum, c) => sum + (c.clicks || 0), 0),
      },
      advertisements: {
        total: advertisements.length,
        active: advertisements.filter(a => a.status === 'active').length,
      },
      zones: {
        total: zones.length,
        active: zones.filter(z => z.status === 'active').length,
      },
    };

    return NextResponse.json(summary, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/dashboard/summary:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    
    // Return a default summary in case of error
    const defaultSummary: DashboardSummary = {
      networks: { total: 0, active: 0 },
      advertisers: { total: 0, active: 0 },
      campaigns: { total: 0, active: 0, paused: 0, totalSpend: 0, totalImpressions: 0, totalClicks: 0 },
      advertisements: { total: 0, active: 0 },
      zones: { total: 0, active: 0 },
    };
    
    return NextResponse.json(
      { 
        ...defaultSummary,
        error: 'Some data may be unavailable due to API errors',
        details: errorMessage 
      },
      { status: 200 }
    );
  }
}
