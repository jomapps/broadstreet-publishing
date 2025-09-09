import { NextRequest, NextResponse } from 'next/server';
import { Advertiser } from '@/types/campaign';

const BROADSTREET_API_TOKEN = process.env.BROADSTREET_API_TOKEN;
const BROADSTREET_API_BASE_URL = process.env.BROADSTREET_API_BASE_URL || 'https://api.broadstreetads.com/api/1';

export async function GET(request: NextRequest) {
  try {

    // Note: Broadstreet API doesn't have a direct advertisers endpoint
    // In a real implementation, you would need to:
    // 1. Fetch networks from the networks API
    // 2. For each network, fetch its advertisers
    // 3. Aggregate the results
    // For now, we return an empty array with proper error handling

    // Check if we have a valid API token
    if (!BROADSTREET_API_TOKEN || BROADSTREET_API_TOKEN === 'demo-token-for-development') {
      // Return sample data for demo mode to showcase functionality
      const mockAdvertisers: Advertiser[] = [
        {
          id: 101,
          name: 'Rainbow Travel Agency',
          networkId: 1,
          status: 'active',
          email: 'contact@rainbowtravel.com',
          phone: '+1-555-0123',
          createdAt: new Date('2023-02-01'),
          updatedAt: new Date('2024-11-20'),
        },
        {
          id: 102,
          name: 'Pride Events Co.',
          networkId: 1,
          status: 'active',
          email: 'info@prideevents.com',
          phone: '+1-555-0124',
          createdAt: new Date('2023-03-15'),
          updatedAt: new Date('2024-12-01'),
        },
        {
          id: 201,
          name: 'Adventure Tours Ltd',
          networkId: 2,
          status: 'active',
          email: 'bookings@adventuretours.com',
          phone: '+1-555-0125',
          createdAt: new Date('2023-04-10'),
          updatedAt: new Date('2024-11-25'),
        },
        {
          id: 202,
          name: 'City Break Hotels',
          networkId: 2,
          status: 'paused',
          email: 'reservations@citybreakhotels.com',
          phone: '+1-555-0126',
          createdAt: new Date('2023-05-20'),
          updatedAt: new Date('2024-10-15'),
        },
      ];

      return NextResponse.json(mockAdvertisers, { status: 200 });
    }

    // In production, fetch real advertisers from Broadstreet API
    try {
      console.log('Fetching advertisers from Broadstreet API...');
      
      // First, get all networks
      const networksResponse = await fetch(`${BROADSTREET_API_BASE_URL}/networks?access_token=${BROADSTREET_API_TOKEN}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!networksResponse.ok) {
        throw new Error(`Networks API error: ${networksResponse.status}`);
      }

      const networksData = await networksResponse.json();
      const networks = networksData.networks || [];
      
      console.log(`Found ${networks.length} networks`);
      
      let allAdvertisers: Advertiser[] = [];
      
      // For each network, fetch its advertisers
      for (const network of networks) {
        try {
          console.log(`Fetching advertisers for network ${network.id} (${network.name})...`);
          
          const advertisersResponse = await fetch(`${BROADSTREET_API_BASE_URL}/advertisers?network_id=${network.id}&access_token=${BROADSTREET_API_TOKEN}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (advertisersResponse.ok) {
            const advertisersData = await advertisersResponse.json();
            const networkAdvertisers = advertisersData.advertisers || [];
            
            // Transform to match our Advertiser interface
            const transformedAdvertisers = networkAdvertisers.map((advertiser: any) => ({
              id: advertiser.id,
              name: advertiser.name || `Advertiser ${advertiser.id}`,
              networkId: network.id,
              status: advertiser.status || 'active',
              email: advertiser.email || '',
              phone: advertiser.phone || '',
              createdAt: advertiser.created_at ? new Date(advertiser.created_at) : new Date(),
              updatedAt: advertiser.updated_at ? new Date(advertiser.updated_at) : new Date(),
            }));
            
            allAdvertisers = allAdvertisers.concat(transformedAdvertisers);
            console.log(`Found ${networkAdvertisers.length} advertisers for network ${network.id}`);
          } else {
            console.warn(`Failed to fetch advertisers for network ${network.id}: ${advertisersResponse.status}`);
          }
        } catch (networkError) {
          console.error(`Error fetching advertisers for network ${network.id}:`, networkError);
        }
      }
      
      console.log(`Total advertisers found: ${allAdvertisers.length}`);
      return NextResponse.json(allAdvertisers, { status: 200 });
      
    } catch (apiError) {
      console.error('Error fetching advertisers from Broadstreet API:', apiError);
      // Return empty array as fallback
      return NextResponse.json([], { status: 200 });
    }

    // Example mock data structure for reference (commented out):
    /*
      const mockAdvertisers: Advertiser[] = [
        // Mock data examples (commented out for reference):
        // {
        //   id: 101,
        //   name: 'Rainbow Travel Agency',
        //   networkId: 1,
        //   status: 'active',
        //   email: 'contact@rainbowtravel.com',
        //   phone: '+1-555-0123',
        //   createdAt: new Date('2023-02-01'),
        //   updatedAt: new Date('2024-11-20'),
        // }
      */
  } catch (error) {
    console.error('Error in GET /api/advertisers:', error);
    
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
      { error: 'Failed to fetch advertisers. Please try again later.' },
      { status: 500 }
    );
  }
}
