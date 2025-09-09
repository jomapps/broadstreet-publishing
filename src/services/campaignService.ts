import axios from 'axios';
import { Campaign, CampaignData } from '@/types/campaign';

const BROADSTREET_API_BASE_URL = process.env.BROADSTREET_API_BASE_URL || 'https://api.broadstreetads.com/v1';
const BROADSTREET_API_TOKEN = process.env.BROADSTREET_API_TOKEN;

if (!BROADSTREET_API_TOKEN) {
  throw new Error('BROADSTREET_API_TOKEN environment variable is required');
}

class CampaignService {
  private apiClient;
  private isDevelopment: boolean;

  constructor() {
    // Only use mock data if explicitly using demo token
    this.isDevelopment = BROADSTREET_API_TOKEN === 'demo-token-for-development';

    this.apiClient = axios.create({
      baseURL: BROADSTREET_API_BASE_URL,
      timeout: 30000, // Increased timeout for multiple API calls
      httpsAgent: process.env.NODE_ENV === 'development' ?
        new (require('https').Agent)({ rejectUnauthorized: false }) : undefined,
    });
  }

  /**
   * Get mock campaigns for development
   */
  private getMockCampaigns(): Campaign[] {
    return [
      {
        id: 1,
        name: 'Summer Sale Campaign',
        status: 'active',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-08-31'),
      },
      {
        id: 2,
        name: 'Back to School Promotion',
        status: 'paused',
        startDate: new Date('2024-08-15'),
        endDate: new Date('2024-09-15'),
      },
      {
        id: 3,
        name: 'Holiday Special',
        status: 'draft',
        startDate: new Date('2024-12-01'),
        endDate: new Date('2024-12-31'),
      },
      {
        id: 4,
        name: 'Spring Launch',
        status: 'completed',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-05-31'),
      },
    ];
  }

  /**
   * Get mock campaign data for development
   */
  private getMockCampaignData(campaignId: number): CampaignData {
    const impressions = Math.floor(Math.random() * 100000) + 10000;
    const clicks = Math.floor(Math.random() * 5000) + 500;
    const spend = Math.floor(Math.random() * 1000) + 100;
    const ctr = clicks / impressions;

    return {
      campaignId,
      impressions,
      clicks,
      spend: Number(spend.toFixed(2)),
      ctr: Number(ctr.toFixed(4)),
    };
  }

  /**
   * Fetch all campaigns from Broadstreet API
   */
  async getAllCampaigns(): Promise<Campaign[]> {
    // Return mock data in development mode
    if (this.isDevelopment) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return this.getMockCampaigns();
    }

    try {
      console.log('Starting to fetch campaigns from Broadstreet API...');

      // First, get all networks to find advertisers
      console.log('Fetching networks...');
      const networksResponse = await this.apiClient.get('/networks', {
        params: {
          access_token: BROADSTREET_API_TOKEN,
        },
      });

      console.log(`Found ${networksResponse.data.networks?.length || 0} networks`);

      const networks = networksResponse.data.networks || [];
      if (!Array.isArray(networks) || networks.length === 0) {
        console.log('No networks found, returning empty array');
        return [];
      }

      // Get campaigns for each network by getting advertisers first
      let allCampaigns: any[] = [];

      for (const network of networks) {
        try {
          console.log(`Fetching advertisers for network ${network.id} (${network.name})...`);

          // Get advertisers for this network
          const advertisersResponse = await this.apiClient.get('/advertisers', {
            params: {
              access_token: BROADSTREET_API_TOKEN,
              network_id: network.id,
            },
          });

          const advertisers = advertisersResponse.data.advertisers || [];
          console.log(`Found ${advertisers.length} advertisers for network ${network.id}`);

          // Limit to first 10 advertisers to avoid timeout
          const limitedAdvertisers = advertisers.slice(0, 10);
          console.log(`Processing first ${limitedAdvertisers.length} advertisers to avoid timeout`);

          // Get campaigns for each advertiser (limited set)
          for (const advertiser of limitedAdvertisers) {
            try {
              console.log(`Fetching campaigns for advertiser ${advertiser.id} (${advertiser.name})...`);

              const campaignsResponse = await this.apiClient.get('/campaigns', {
                params: {
                  access_token: BROADSTREET_API_TOKEN,
                  advertiser_id: advertiser.id,
                },
              });

              const campaigns = campaignsResponse.data.campaigns || [];
              console.log(`Found ${campaigns.length} campaigns for advertiser ${advertiser.id}`);

              // Add network ID to each campaign
              const campaignsWithNetwork = campaigns.map((campaign: any) => ({
                ...campaign,
                networkId: network.id,
                advertiserId: advertiser.id,
              }));

              allCampaigns = allCampaigns.concat(campaignsWithNetwork);
            } catch (campaignError) {
              console.error(`Error fetching campaigns for advertiser ${advertiser.id}:`, campaignError);
            }
          }
        } catch (advertiserError) {
          console.error(`Error fetching advertisers for network ${network.id}:`, advertiserError);
        }
      }

      console.log(`Total campaigns found: ${allCampaigns.length}`);

      // Transform the response to match our Campaign interface
      return allCampaigns.map((campaign: any) => ({
        id: campaign.id,
        name: campaign.name,
        status: campaign.active ? 'active' : 'paused',
        startDate: campaign.start_date ? new Date(campaign.start_date) : undefined,
        endDate: campaign.end_date ? new Date(campaign.end_date) : undefined,
        budget: campaign.max_impression_count || 0,
        spent: 0, // This would need to come from a separate stats endpoint
        impressions: 0, // This would need to come from a separate stats endpoint
        clicks: 0, // This would need to come from a separate stats endpoint
        ctr: 0, // This would need to come from a separate stats endpoint
        networkId: campaign.networkId, // Include the network ID for filtering
        advertiserId: campaign.advertiserId, // Include the advertiser ID for reference
      }));
    } catch (error) {
      console.error('Error fetching campaigns from Broadstreet API:', error);

      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          console.error('API request timed out');
        }
        if (error.response?.status === 429) {
          console.error('Rate limit exceeded');
        }
        if (error.response?.status === 401) {
          console.error('Invalid API token');
        }
        if (error.response?.status && error.response.status >= 500) {
          console.error('Broadstreet API server error');
        }
      }

      // Return empty array instead of throwing error to prevent UI from breaking
      console.log('Returning empty campaigns array due to API error');
      return [];
    }
  }

  /**
   * Fetch detailed campaign data from Broadstreet API
   */
  async getCampaignData(campaignId: number): Promise<CampaignData> {
    // Return mock data in development mode
    if (this.isDevelopment) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      // Check if campaign exists in mock data
      const mockCampaigns = this.getMockCampaigns();
      const campaignExists = mockCampaigns.some(c => c.id === campaignId);

      if (!campaignExists) {
        throw new Error(`Campaign with ID ${campaignId} not found`);
      }

      return this.getMockCampaignData(campaignId);
    }

    try {
      const response = await this.apiClient.get('/records', {
        params: {
          access_token: BROADSTREET_API_TOKEN,
          type: 'campaign',
          id: campaignId,
          summary: 1,
        },
      });

      const data = response.data;
      const totals = data.totals || {};

      // Transform the response to match our CampaignData interface
      return {
        campaignId: campaignId,
        impressions: totals.views || 0,
        clicks: totals.clicks || 0,
        ctr: totals.views > 0 ? (totals.clicks / totals.views) * 100 : 0,
        spend: 0, // Spend data not available in records API
      };
    } catch (error) {
      console.error(`Error fetching campaign data for ID ${campaignId}:`, error);

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error(`Campaign with ID ${campaignId} not found`);
        }
        if (error.response?.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        if (error.response?.status === 401) {
          throw new Error('Invalid API token. Please check your credentials.');
        }
        if (error.response?.status && error.response.status >= 500) {
          throw new Error('Broadstreet API is currently unavailable. Please try again later.');
        }
      }

      throw new Error(`Failed to fetch campaign data for ID ${campaignId}`);
    }
  }
}

// Export a singleton instance
const campaignService = new CampaignService();
export default campaignService;
