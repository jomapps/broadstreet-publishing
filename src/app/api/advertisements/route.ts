import { NextRequest, NextResponse } from 'next/server';
import { Advertisement } from '@/types/campaign';

const BROADSTREET_API_TOKEN = process.env.BROADSTREET_API_TOKEN;
const BROADSTREET_API_BASE_URL = process.env.BROADSTREET_API_BASE_URL || 'https://api.broadstreetads.com/api/1';

export async function GET(request: NextRequest) {
  try {

    // Note: Broadstreet API doesn't have a direct advertisements endpoint
    // In a real implementation, you would need to:
    // 1. Fetch campaigns from the campaigns API
    // 2. For each campaign, fetch its advertisements using the ads endpoint
    // 3. Aggregate the results
    // For now, we return an empty array with proper error handling

    // Check if we have a valid API token
    if (!BROADSTREET_API_TOKEN || BROADSTREET_API_TOKEN === 'demo-token-for-development') {
      // Return sample data for demo mode to showcase functionality
      const mockAdvertisements: Advertisement[] = [
        {
          id: 1001,
          name: 'Summer Pride Banner',
          campaignId: 749671,
          advertiserId: 101,
          networkId: 1,
          type: 'banner',
          status: 'active',
          width: 728,
          height: 90,
          createdAt: new Date('2024-06-01'),
          updatedAt: new Date('2024-12-01'),
        },
        {
          id: 1002,
          name: 'Pride Events Text Ad',
          campaignId: 749672,
          advertiserId: 102,
          networkId: 1,
          type: 'text',
          status: 'active',
          createdAt: new Date('2024-07-15'),
          updatedAt: new Date('2024-11-20'),
        },
        {
          id: 2001,
          name: 'Adventure Tours Video',
          campaignId: 749673,
          advertiserId: 201,
          networkId: 2,
          type: 'video',
          status: 'active',
          width: 640,
          height: 360,
          createdAt: new Date('2024-08-01'),
          updatedAt: new Date('2024-11-25'),
        },
        {
          id: 2002,
          name: 'Hotel Booking Banner',
          campaignId: 749674,
          advertiserId: 202,
          networkId: 2,
          type: 'banner',
          status: 'paused',
          width: 300,
          height: 250,
          createdAt: new Date('2024-09-10'),
          updatedAt: new Date('2024-10-15'),
        },
      ];

      return NextResponse.json(mockAdvertisements, { status: 200 });
    }

    // In production, fetch real advertisements from Broadstreet API
    // Using network-based approach that actually works (confirmed by terminal output)
    try {
      console.log('Fetching advertisements from Broadstreet API using network-based approach...');
      
      // First, get all networks
      const networksResponse = await fetch(`http://localhost:3005/api/networks`);
      
      if (!networksResponse.ok) {
        throw new Error(`Networks API error: ${networksResponse.status}`);
      }

      const networks = await networksResponse.json();
      console.log(`Found ${networks.length} networks to fetch advertisements from`);
      
      let allAdvertisements: Advertisement[] = [];
      
      // For each network, fetch advertisements using network_id parameter
      for (const network of networks) {
        try {
          console.log(`Fetching advertisements for network ${network.id} (${network.name})...`);
          
          const networkAdsResponse = await fetch(`${BROADSTREET_API_BASE_URL}/advertisements?network_id=${network.id}&access_token=${BROADSTREET_API_TOKEN}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (networkAdsResponse.ok) {
            const networkAdsData = await networkAdsResponse.json();
            const networkAds = networkAdsData.advertisements || [];
            
            console.log(`Found ${networkAds.length} advertisements for network ${network.id}`);
            
            // Transform to match our Advertisement interface
            const transformedAds = networkAds.map((ad: any) => ({
              id: ad.id,
              name: ad.name || `Advertisement ${ad.id}`,
              campaignId: ad.campaign_id || null,
              advertiserId: ad.advertiser_id || null,
              networkId: network.id,
              type: ad.type === 'StaticAdvertisement' ? 'banner' : (ad.type || 'banner').toLowerCase(),
              status: ad.active_placement === false ? 'inactive' : 'active',
              width: ad.width || null,
              height: ad.height || null,
              createdAt: ad.created_at ? new Date(ad.created_at) : new Date(),
              updatedAt: ad.updated_at ? new Date(ad.updated_at) : new Date(),
            }));
            
            allAdvertisements = allAdvertisements.concat(transformedAds);
          } else {
            console.warn(`Failed to fetch advertisements for network ${network.id}: ${networkAdsResponse.status}`);
          }
        } catch (networkError) {
          console.error(`Error fetching advertisements for network ${network.id}:`, networkError);
        }
      }
      
      console.log(`Total advertisements found: ${allAdvertisements.length}`);
      return NextResponse.json(allAdvertisements, { status: 200 });
      
    } catch (apiError) {
      console.error('Error fetching advertisements from Broadstreet API:', apiError);
      // Return empty array as fallback
      return NextResponse.json([], { status: 200 });
    }

    // Example mock data structure for reference (commented out):
    /*
      // Mock data examples (commented out for reference):
      // {
      //   id: 1001,
      //   name: 'Summer Pride Banner',
      //   campaignId: 749671,
      //   advertiserId: 101,
      //   networkId: 1,
      //   type: 'banner',
      //   status: 'active',
      //   width: 728,
      //   height: 90,
      //   createdAt: new Date('2024-06-01'),
      //   updatedAt: new Date('2024-12-01'),
      // }
      */
  } catch (error) {
    console.error('Error in GET /api/advertisements:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    
    // Handle specific error types
    if (errorMessage.includes('Rate limit exceeded')) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }
    
    if (errorMessage.includes('Invalid API token')) {
      return NextResponse.json(
        { error: 'Authentication failed. Please check API configuration.' },
        { status: 401 }
      );
    }
    
    if (errorMessage.includes('timeout')) {
      return NextResponse.json(
        { error: 'Request timeout. The API is taking too long to respond.' },
        { status: 408 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch advertisements. Please try again later.' },
      { status: 500 }
    );
  }
}
