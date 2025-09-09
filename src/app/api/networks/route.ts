import { NextRequest, NextResponse } from 'next/server';
import { Network } from '@/types/campaign';

const BROADSTREET_API_TOKEN = process.env.BROADSTREET_API_TOKEN;
const BROADSTREET_API_BASE_URL = process.env.BROADSTREET_API_BASE_URL || 'https://api.broadstreetads.com/api/1';

export async function GET(request: NextRequest) {
  try {
    // Return mock data only when using demo token
    if (!BROADSTREET_API_TOKEN || BROADSTREET_API_TOKEN === 'demo-token-for-development') {
      const mockNetworks: Network[] = [
        {
          id: 1,
          name: 'FASH Medien Verlag GmbH - SCHWULISSIMO',
          description: 'LGBTQ+ lifestyle and entertainment network',
          status: 'active',
          createdAt: new Date('2023-01-15'),
          updatedAt: new Date('2024-12-01'),
        },
        {
          id: 2,
          name: 'FASH Medien Verlag GmbH - Travel M',
          description: 'Travel and tourism advertising network',
          status: 'active',
          createdAt: new Date('2023-03-20'),
          updatedAt: new Date('2024-11-15'),
        },
        {
          id: 3,
          name: 'Demo Network - Inactive',
          description: 'Inactive demo network for testing',
          status: 'paused',
          createdAt: new Date('2023-06-10'),
          updatedAt: new Date('2024-10-01'),
        },
      ];

      return NextResponse.json(mockNetworks, { status: 200 });
    }

    // Fetch from real Broadstreet API
    const response = await fetch(`${BROADSTREET_API_BASE_URL}/networks?access_token=${BROADSTREET_API_TOKEN}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add timeout for production
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      throw new Error(`Broadstreet API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const networks = data.networks || [];

    // Transform the response to match our Network interface
    const transformedNetworks: Network[] = networks.map((network: any) => ({
      id: network.id,
      name: network.name,
      description: network.description || '',
      status: network.active ? 'active' : 'paused',
      createdAt: network.created_at ? new Date(network.created_at) : undefined,
      updatedAt: network.updated_at ? new Date(network.updated_at) : undefined,
    }));

    return NextResponse.json(transformedNetworks, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/networks:', error);
    
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
      { error: 'Failed to fetch networks. Please try again later.' },
      { status: 500 }
    );
  }
}
