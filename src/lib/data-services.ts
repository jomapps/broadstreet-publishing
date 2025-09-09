import { Campaign, CampaignData, Advertiser, Advertisement, Zone, Network, DashboardSummary } from '@/types/campaign';
import { 
  networkRepository, 
  advertiserRepository, 
  campaignRepository,
  advertisementRepository,
  zoneRepository
} from './database-repository';
import { initializationService } from '../services/initializationService';
import { syncService } from '../services/syncService';

// Helper function to get the correct base URL for API calls
function getBaseUrl(): string {
  // Use environment variable for site URL (works for both dev and production)
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  // Fallback for production (Vercel)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Final fallback (should not be reached with proper env setup)
  return 'http://localhost:3005';
}

// Helper function to handle API responses
async function fetchApi<T>(endpoint: string): Promise<T> {
  try {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}${endpoint}`, {
      cache: 'no-store', // Always fetch fresh data for server components
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
}

// Helper function to serialize MongoDB documents to plain objects
function serializeNetwork(doc: any): Network {
  return {
    id: doc.id,
    name: doc.name,
    description: doc.description,
    status: doc.status,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt
  };
}

function serializeCampaign(doc: any): Campaign {
  return {
    id: doc.id,
    name: doc.name,
    status: doc.status,
    startDate: doc.startDate,
    endDate: doc.endDate,
    budget: doc.budget,
    spent: doc.spent,
    impressions: doc.impressions,
    clicks: doc.clicks,
    ctr: doc.ctr,
    advertiserId: doc.advertiserId,
    networkId: doc.networkId
  };
}

function serializeAdvertiser(doc: any): Advertiser {
  return {
    id: doc.id,
    name: doc.name,
    networkId: doc.networkId,
    status: doc.status,
    email: doc.email,
    phone: doc.phone,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt
  };
}

function serializeAdvertisement(doc: any): Advertisement {
  return {
    id: doc.id,
    name: doc.name,
    campaignId: doc.campaignId,
    advertiserId: doc.advertiserId,
    networkId: doc.networkId,
    type: doc.type,
    status: doc.status,
    width: doc.width,
    height: doc.height,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt
  };
}

function serializeZone(doc: any): Zone {
  return {
    id: doc.id,
    name: doc.name,
    networkId: doc.networkId,
    type: doc.type,
    width: doc.width,
    height: doc.height,
    status: doc.status,
    description: doc.description,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt
  };
}

// Network data service with local database integration
export async function getNetworks(): Promise<Network[]> {
  try {
    // Ensure database is initialized
    await initializationService.ensureInitialized();
    
    // Try to get from local database first
    const localNetworks = await networkRepository.findAll({}, { sort: { name: 1 } });
    
    // If we have local data, serialize and return it
    if (localNetworks.length > 0) {
      console.log(`Retrieved ${localNetworks.length} networks from local database`);
      return localNetworks.map(serializeNetwork);
    }
    
    // Fallback to API if no local data
    console.log('No local networks found, falling back to API...');
    const apiNetworks = await fetchApi<Network[]>('/api/networks');
    
    // Trigger background sync to populate local database
    if (apiNetworks.length > 0) {
      syncService.syncNetworks().catch(error => {
        console.error('Background network sync failed:', error);
      });
    }
    
    return apiNetworks;
  } catch (error) {
    console.error('Failed to fetch networks:', error);
    return [];
  }
}

// Campaign data services
export async function getCampaigns(): Promise<Campaign[]> {
  try {
    // Ensure database is initialized
    await initializationService.ensureInitialized();
    
    // Try to get from local database first
    const localCampaigns = await campaignRepository.findAll({}, { sort: { startDate: -1 } });
    
    // If we have local data, serialize and return it
    if (localCampaigns.length > 0) {
      console.log(`Retrieved ${localCampaigns.length} campaigns from local database`);
      return localCampaigns.map(serializeCampaign);
    }
    
    // Fallback to API if no local data
    console.log('No local campaigns found, falling back to API...');
    const apiCampaigns = await fetchApi<Campaign[]>('/api/campaigns');
    
    // Trigger background sync to populate local database
    if (apiCampaigns.length > 0) {
      syncService.syncCampaigns().catch(error => {
        console.error('Background campaign sync failed:', error);
      });
    }
    
    return apiCampaigns;
  } catch (error) {
    console.error('Failed to fetch campaigns:', error);
    return [];
  }
}

export async function getCampaignData(campaignId: number): Promise<CampaignData | null> {
  try {
    return await fetchApi<CampaignData>(`/api/campaigns/${campaignId}`);
  } catch (error) {
    console.error(`Failed to fetch campaign data for ID ${campaignId}:`, error);
    return null;
  }
}

// Advertiser data service
export async function getAdvertisers(networkId?: number): Promise<Advertiser[]> {
  try {
    // Ensure database is initialized
    await initializationService.ensureInitialized();
    
    // Try to get from local database first
    const localAdvertisers = networkId 
      ? await advertiserRepository.getByNetworkId(networkId)
      : await advertiserRepository.findAll({}, { sort: { name: 1 } });
    
    // If we have local data, serialize and return it
    if (localAdvertisers.length > 0) {
      console.log(`Retrieved ${localAdvertisers.length} advertisers from local database`);
      return localAdvertisers.map(serializeAdvertiser);
    }
    
    // Fallback to API if no local data
    console.log('No local advertisers found, falling back to API...');
    const endpoint = networkId ? `/api/advertisers?network_id=${networkId}` : '/api/advertisers';
    const apiAdvertisers = await fetchApi<Advertiser[]>(endpoint);
    
    // Trigger background sync to populate local database
    if (apiAdvertisers.length > 0) {
      syncService.syncAdvertisers(networkId).catch(error => {
        console.error('Background advertiser sync failed:', error);
      });
    }
    
    return apiAdvertisers;
  } catch (error) {
    console.error('Failed to fetch advertisers:', error);
    return [];
  }
}

// Advertisement data service
export async function getAdvertisements(networkId?: number): Promise<Advertisement[]> {
  try {
    // Ensure database is initialized
    await initializationService.ensureInitialized();
    
    // Try to get from local database first
    const localAdvertisements = networkId 
      ? await advertisementRepository.getByNetworkId(networkId)
      : await advertisementRepository.findAll({}, { sort: { name: 1 } });
    
    // If we have local data, serialize and return it
    if (localAdvertisements.length > 0) {
      console.log(`Retrieved ${localAdvertisements.length} advertisements from local database`);
      return localAdvertisements.map(serializeAdvertisement);
    }
    
    // Fallback to API if no local data
    console.log('No local advertisements found, falling back to API...');
    const endpoint = networkId ? `/api/advertisements?network_id=${networkId}` : '/api/advertisements';
    const apiAdvertisements = await fetchApi<Advertisement[]>(endpoint);
    
    // Trigger background sync to populate local database
    if (apiAdvertisements.length > 0) {
      syncService.syncAdvertisements().catch(error => {
        console.error('Background advertisement sync failed:', error);
      });
    }
    
    return apiAdvertisements;
  } catch (error) {
    console.error('Failed to fetch advertisements:', error);
    return [];
  }
}

// Zone data service
export async function getZones(networkId?: number): Promise<Zone[]> {
  try {
    // Ensure database is initialized
    await initializationService.ensureInitialized();
    
    // Try to get from local database first
    const localZones = networkId 
      ? await zoneRepository.getByNetworkId(networkId)
      : await zoneRepository.findAll({}, { sort: { name: 1 } });
    
    // If we have local data, serialize and return it
    if (localZones.length > 0) {
      console.log(`Retrieved ${localZones.length} zones from local database`);
      return localZones.map(serializeZone);
    }
    
    // Fallback to API if no local data
    console.log('No local zones found, falling back to API...');
    const endpoint = networkId ? `/api/zones?network_id=${networkId}` : '/api/zones';
    const apiZones = await fetchApi<Zone[]>(endpoint);
    
    // Trigger background sync to populate local database
    if (apiZones.length > 0) {
      syncService.syncZones(networkId).catch(error => {
        console.error('Background zone sync failed:', error);
      });
    }
    
    return apiZones;
  } catch (error) {
    console.error('Failed to fetch zones:', error);
    return [];
  }
}

// Dashboard summary data service
export async function getDashboardSummary(networkId?: number): Promise<DashboardSummary | null> {
  try {
    // Ensure database is initialized
    await initializationService.ensureInitialized();
    
    // Try to generate summary from local database first
    try {
      const [networkStats, advertiserStats, campaignStats, advertisementStats, zoneStats] = await Promise.all([
        networkRepository.getNetworkStats(),
        advertiserRepository.getAdvertiserStats(networkId),
        campaignRepository.getCampaignStats(networkId),
        advertisementRepository.getAdvertisementStats(networkId),
        zoneRepository.getZoneStats(networkId)
      ]);
      
      // If we have meaningful local data, return it
      if (campaignStats.total > 0 || networkStats.total > 0) {
        console.log('Generated dashboard summary from local database');
        return {
          networks: networkStats,
          advertisers: advertiserStats,
          campaigns: campaignStats,
          advertisements: advertisementStats,
          zones: zoneStats
        };
      }
    } catch (localError) {
      console.warn('Failed to generate local dashboard summary:', localError);
    }
    
    // Fallback to API if no meaningful local data
    console.log('No meaningful local data found, falling back to API...');
    const endpoint = networkId ? `/api/dashboard/summary?network_id=${networkId}` : '/api/dashboard/summary';
    const apiSummary = await fetchApi<DashboardSummary>(endpoint);
    
    // Trigger background sync to populate local database
    syncService.performFullSync().catch(error => {
      console.error('Background full sync failed:', error);
    });
    
    return apiSummary;
  } catch (error) {
    console.error('Failed to fetch dashboard summary:', error);
    return null;
  }
}

// Utility function to get network by ID
export async function getNetworkById(networkId: number): Promise<Network | null> {
  try {
    const networks = await getNetworks();
    return networks.find(network => network.id === networkId) || null;
  } catch (error) {
    console.error(`Failed to fetch network with ID ${networkId}:`, error);
    return null;
  }
}
