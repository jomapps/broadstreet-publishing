import { NextRequest, NextResponse } from 'next/server';
import campaignService from '@/services/campaignService';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = parseInt(params.id, 10);
    
    // Validate campaign ID
    if (isNaN(campaignId) || campaignId <= 0) {
      return NextResponse.json(
        { error: 'Invalid campaign ID. Must be a positive integer.' },
        { status: 400 }
      );
    }
    
    const campaignData = await campaignService.getCampaignData(campaignId);
    
    return NextResponse.json(campaignData, { status: 200 });
  } catch (error) {
    console.error(`Error in GET /api/campaigns/${params.id}:`, error);
    
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    
    // Handle specific error types
    if (errorMessage.includes('not found')) {
      return NextResponse.json(
        { error: `Campaign with ID ${params.id} not found` },
        { status: 404 }
      );
    }
    
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
      { error: 'Failed to fetch campaign data' },
      { status: 500 }
    );
  }
}
