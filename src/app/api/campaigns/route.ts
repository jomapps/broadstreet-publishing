import { NextRequest, NextResponse } from 'next/server';
import campaignService from '@/services/campaignService';

export async function GET(request: NextRequest) {
  try {
    const campaigns = await campaignService.getAllCampaigns();
    
    return NextResponse.json(campaigns, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/campaigns:', error);
    
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
    
    if (errorMessage.includes('currently unavailable')) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again later.' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}
