import { NextRequest, NextResponse } from 'next/server';
import { Zone } from '@/types/campaign';

const BROADSTREET_API_TOKEN = process.env.BROADSTREET_API_TOKEN;
const BROADSTREET_API_BASE_URL = process.env.BROADSTREET_API_BASE_URL || 'https://api.broadstreetads.com/api/1';

export async function GET(request: NextRequest) {
  try {

    // Note: Broadstreet API doesn't have a direct zones endpoint
    // In a real implementation, you would need to:
    // 1. Fetch networks from the networks API
    // 2. For each network, fetch its zones using the zones endpoint
    // 3. Aggregate the results
    // For now, we return an empty array with proper error handling

    // Check if we have a valid API token
    if (!BROADSTREET_API_TOKEN || BROADSTREET_API_TOKEN === 'demo-token-for-development') {
      // Return sample data for demo mode to showcase functionality
      const mockZones: Zone[] = [
        {
          id: 5001,
          name: 'Header Banner Zone',
          networkId: 1,
          type: 'banner',
          width: 728,
          height: 90,
          status: 'active',
          description: 'Main header banner placement for SCHWULISSIMO',
          createdAt: new Date('2023-01-20'),
          updatedAt: new Date('2024-12-01'),
        },
        {
          id: 5002,
          name: 'Sidebar Rectangle Zone',
          networkId: 1,
          type: 'banner',
          width: 300,
          height: 250,
          status: 'active',
          description: 'Sidebar medium rectangle placement',
          createdAt: new Date('2023-02-10'),
          updatedAt: new Date('2024-11-15'),
        },
        {
          id: 5003,
          name: 'Article Text Zone',
          networkId: 1,
          type: 'text',
          status: 'active',
          description: 'In-article text advertisement zone',
          createdAt: new Date('2023-03-05'),
          updatedAt: new Date('2024-10-20'),
        },
        {
          id: 6001,
          name: 'Travel Header Zone',
          networkId: 2,
          type: 'banner',
          width: 970,
          height: 250,
          status: 'active',
          description: 'Large header banner for Travel M network',
          createdAt: new Date('2023-03-25'),
          updatedAt: new Date('2024-11-30'),
        },
        {
          id: 6002,
          name: 'Video Player Zone',
          networkId: 2,
          type: 'video',
          width: 640,
          height: 360,
          status: 'active',
          description: 'Pre-roll video advertisement zone',
          createdAt: new Date('2023-04-15'),
          updatedAt: new Date('2024-11-25'),
        },
        {
          id: 6003,
          name: 'Footer Banner Zone',
          networkId: 2,
          type: 'banner',
          width: 728,
          height: 90,
          status: 'paused',
          description: 'Footer banner placement (currently paused)',
          createdAt: new Date('2023-05-01'),
          updatedAt: new Date('2024-09-15'),
        },
      ];

      return NextResponse.json(mockZones, { status: 200 });
    }

    // In production, fetch real zones from Broadstreet API
    try {
      console.log('Fetching zones from Broadstreet API...');
      
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
      
      let allZones: Zone[] = [];
      
      // For each network, fetch its zones
      for (const network of networks) {
        try {
          console.log(`Fetching zones for network ${network.id} (${network.name})...`);
          
          const zonesResponse = await fetch(`${BROADSTREET_API_BASE_URL}/zones?network_id=${network.id}&access_token=${BROADSTREET_API_TOKEN}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (zonesResponse.ok) {
            const zonesData = await zonesResponse.json();
            const networkZones = zonesData.zones || [];
            
            // Transform to match our Zone interface
            const transformedZones = networkZones.map((zone: any) => ({
              id: zone.id,
              name: zone.name || `Zone ${zone.id}`,
              networkId: network.id,
              type: zone.type || 'banner',
              width: zone.width || null,
              height: zone.height || null,
              status: zone.status || 'active',
              description: zone.description || '',
              createdAt: zone.created_at ? new Date(zone.created_at) : new Date(),
              updatedAt: zone.updated_at ? new Date(zone.updated_at) : new Date(),
            }));
            
            allZones = allZones.concat(transformedZones);
            console.log(`Found ${networkZones.length} zones for network ${network.id}`);
          } else {
            console.warn(`Failed to fetch zones for network ${network.id}: ${zonesResponse.status}`);
          }
        } catch (networkError) {
          console.error(`Error fetching zones for network ${network.id}:`, networkError);
        }
      }
      
      console.log(`Total zones found: ${allZones.length}`);
      return NextResponse.json(allZones, { status: 200 });
      
    } catch (apiError) {
      console.error('Error fetching zones from Broadstreet API:', apiError);
      // Return empty array as fallback
      return NextResponse.json([], { status: 200 });
    }

    // Example mock data structure for reference (commented out):
    /*
      const mockZones: Zone[] = [
        // Mock data examples (commented out for reference):
        // {
        //   id: 5001,
        //   name: 'Header Banner Zone',
        //   networkId: 1,
        //   type: 'banner',
        //   width: 728,
        //   height: 90,
        //   status: 'active',
        //   description: 'Main header banner placement for SCHWULISSIMO',
        //   createdAt: new Date('2023-01-20'),
        //   updatedAt: new Date('2024-12-01'),
        // }
      */
  } catch (error) {
    console.error('Error in GET /api/zones:', error);
    
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
      { error: 'Failed to fetch zones. Please try again later.' },
      { status: 500 }
    );
  }
}
