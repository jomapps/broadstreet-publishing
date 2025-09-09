import axios from 'axios';
import {
  networkRepository,
  advertiserRepository,
  campaignRepository,
  advertisementRepository,
  zoneRepository,
  syncMetadataRepository
} from '../lib/database-repository';
import { EntityTypes } from '../models';
import type { Network, Advertiser, Campaign, Advertisement, Zone } from '../types/campaign';

const BROADSTREET_API_BASE_URL = process.env.BROADSTREET_API_BASE_URL || 'https://api.broadstreetads.com/api/1';
const BROADSTREET_API_TOKEN = process.env.BROADSTREET_API_TOKEN;

if (!BROADSTREET_API_TOKEN) {
  throw new Error('BROADSTREET_API_TOKEN environment variable is required');
}

// API client configuration
const apiClient = axios.create({
  baseURL: BROADSTREET_API_BASE_URL,
  timeout: 30000,
  httpsAgent: process.env.NODE_ENV === 'development' ?
    new (require('https').Agent)({ rejectUnauthorized: false }) : undefined,
});

/**
 * Comprehensive synchronization service for BroadStreet API data
 */
class SyncService {
  private activeSyncs = new Set<string>();

  /**
   * Sync networks from BroadStreet API
   */
  async syncNetworks(): Promise<{ processed: number; created: number; updated: number }> {
    const syncKey = 'networks';
    if (this.activeSyncs.has(syncKey)) {
      throw new Error('Networks sync already in progress');
    }

    this.activeSyncs.add(syncKey);
    console.log('Starting networks sync...');

    try {
      // Fetch networks from API
      const response = await apiClient.get(`/networks?access_token=${BROADSTREET_API_TOKEN}`);
      
      console.log('Networks API response:', JSON.stringify(response.data, null, 2));
      
      // Handle different API response formats
      let apiNetworks: Network[] = [];
      if (Array.isArray(response.data)) {
        apiNetworks = response.data;
      } else if (response.data && Array.isArray(response.data.networks)) {
        // BroadStreet API returns { networks: [...] }
        apiNetworks = response.data.networks;
      } else if (response.data && Array.isArray(response.data.data)) {
        apiNetworks = response.data.data;
      } else if (response.data && typeof response.data === 'object') {
        // If it's a single network object, wrap it in an array
        apiNetworks = [response.data];
      } else {
        console.warn('Unexpected API response format for networks:', response.data);
        return { processed: 0, created: 0, updated: 0 };
      }
      
      console.log('Processed networks:', apiNetworks.length, apiNetworks);

      let created = 0;
      let updated = 0;

      // Process each network
      for (const apiNetwork of apiNetworks) {
        try {
          // Validate required fields
          if (!apiNetwork.id) {
            console.warn('Skipping network without ID:', apiNetwork);
            continue;
          }
          
          const existing = await networkRepository.findById(apiNetwork.id);
          
          if (existing) {
            // Update existing network
            await networkRepository.update(apiNetwork.id, {
              name: apiNetwork.name || `Network ${apiNetwork.id}`,
              description: apiNetwork.description || '',
              status: apiNetwork.status || 'active',
              updatedAt: new Date()
            });
            updated++;
          } else {
            // Create new network
            await networkRepository.create({
              id: apiNetwork.id,
              name: apiNetwork.name || `Network ${apiNetwork.id}`,
              description: apiNetwork.description || '',
              status: apiNetwork.status || 'active',
              createdAt: apiNetwork.createdAt ? new Date(apiNetwork.createdAt) : new Date(),
              updatedAt: new Date()
            });
            created++;
          }
        } catch (error) {
          console.error(`Failed to sync network ${apiNetwork.id}:`, error);
        }
      }

      console.log(`Networks sync completed: ${created} created, ${updated} updated`);
      return { processed: apiNetworks.length, created, updated };

    } catch (error) {
      console.error('Networks sync failed:', error);
      throw error;
    } finally {
      this.activeSyncs.delete(syncKey);
    }
  }

  /**
   * Sync advertisers from BroadStreet API
   */
  async syncAdvertisers(networkId?: number): Promise<{ processed: number; created: number; updated: number }> {
    const syncKey = `advertisers-${networkId || 'all'}`;
    if (this.activeSyncs.has(syncKey)) {
      throw new Error(`Advertisers sync already in progress for ${networkId || 'all networks'}`);
    }

    this.activeSyncs.add(syncKey);
    console.log(`Starting advertisers sync for ${networkId ? `network ${networkId}` : 'all networks'}...`);

    try {
      let allAdvertisers: Advertiser[] = [];

      if (networkId) {
        // Sync advertisers for specific network
        const response = await apiClient.get(`/advertisers?network_id=${networkId}&access_token=${BROADSTREET_API_TOKEN}`);
        
        // Handle different API response formats
        let responseData: any[] = [];
        if (Array.isArray(response.data)) {
          responseData = response.data;
        } else if (response.data && Array.isArray(response.data.advertisers)) {
          // BroadStreet API returns { advertisers: [...] }
          responseData = response.data.advertisers;
        } else if (response.data && Array.isArray(response.data.data)) {
          responseData = response.data.data;
        } else if (response.data && typeof response.data === 'object') {
          responseData = [response.data];
        }
        
        allAdvertisers = responseData.map((adv: any) => ({ ...adv, networkId }));
      } else {
        // Sync advertisers for all networks
        const networks = await networkRepository.getActiveNetworks();
        
        for (const network of networks) {
          try {
            const response = await apiClient.get(`/advertisers?network_id=${network.id}&access_token=${BROADSTREET_API_TOKEN}`);
            
            // Handle different API response formats
            let responseData: any[] = [];
            if (Array.isArray(response.data)) {
              responseData = response.data;
            } else if (response.data && Array.isArray(response.data.advertisers)) {
              // BroadStreet API returns { advertisers: [...] }
              responseData = response.data.advertisers;
            } else if (response.data && Array.isArray(response.data.data)) {
              responseData = response.data.data;
            } else if (response.data && typeof response.data === 'object') {
              responseData = [response.data];
            }
            
            const networkAdvertisers = responseData.map((adv: any) => ({ ...adv, networkId: network.id }));
            allAdvertisers.push(...networkAdvertisers);
          } catch (error) {
            console.error(`Failed to fetch advertisers for network ${network.id}:`, error);
          }
        }
      }

      let created = 0;
      let updated = 0;

      // Process each advertiser
      for (const apiAdvertiser of allAdvertisers) {
        try {
          const existing = await advertiserRepository.findById(apiAdvertiser.id);
          
          if (existing) {
            // Update existing advertiser
            await advertiserRepository.update(apiAdvertiser.id, {
              name: apiAdvertiser.name || `Advertiser ${apiAdvertiser.id}`,
              networkId: apiAdvertiser.networkId,
              status: apiAdvertiser.status || 'active',
              email: apiAdvertiser.email || '',
              phone: apiAdvertiser.phone || '',
              updatedAt: new Date()
            });
            updated++;
          } else {
            // Create new advertiser
            await advertiserRepository.create({
              id: apiAdvertiser.id,
              name: apiAdvertiser.name || `Advertiser ${apiAdvertiser.id}`,
              networkId: apiAdvertiser.networkId,
              status: apiAdvertiser.status || 'active',
              email: apiAdvertiser.email || '',
              phone: apiAdvertiser.phone || '',
              createdAt: apiAdvertiser.createdAt ? new Date(apiAdvertiser.createdAt) : new Date(),
              updatedAt: new Date()
            });
            created++;
          }
        } catch (error) {
          console.error(`Failed to sync advertiser ${apiAdvertiser.id}:`, error);
        }
      }

      console.log(`Advertisers sync completed: ${created} created, ${updated} updated`);
      return { processed: allAdvertisers.length, created, updated };

    } catch (error) {
      console.error('Advertisers sync failed:', error);
      throw error;
    } finally {
      this.activeSyncs.delete(syncKey);
    }
  }

  /**
   * Sync campaigns from BroadStreet API
   */
  async syncCampaigns(advertiserId?: number): Promise<{ processed: number; created: number; updated: number }> {
    const syncKey = `campaigns-${advertiserId || 'all'}`;
    if (this.activeSyncs.has(syncKey)) {
      throw new Error(`Campaigns sync already in progress for ${advertiserId || 'all advertisers'}`);
    }

    this.activeSyncs.add(syncKey);
    console.log(`Starting campaigns sync for ${advertiserId ? `advertiser ${advertiserId}` : 'all advertisers'}...`);

    try {
      let allCampaigns: Campaign[] = [];

      if (advertiserId) {
        // Sync campaigns for specific advertiser
        const response = await apiClient.get(`/campaigns?advertiser_id=${advertiserId}&access_token=${BROADSTREET_API_TOKEN}`);
        
        // Handle different API response formats
        let responseData: any[] = [];
        if (Array.isArray(response.data)) {
          responseData = response.data;
        } else if (response.data && Array.isArray(response.data.campaigns)) {
          // BroadStreet API returns { campaigns: [...] }
          responseData = response.data.campaigns;
        } else if (response.data && Array.isArray(response.data.data)) {
          responseData = response.data.data;
        } else if (response.data && typeof response.data === 'object') {
          responseData = [response.data];
        }
        
        allCampaigns = responseData.map((camp: any) => ({ ...camp, advertiserId }));
      } else {
        // Sync campaigns for all advertisers
        const advertisers = await advertiserRepository.findAll({ status: 'active' });
        
        for (const advertiser of advertisers) {
          try {
            const response = await apiClient.get(`/campaigns?advertiser_id=${advertiser.id}&access_token=${BROADSTREET_API_TOKEN}`);
            
            // Handle different API response formats
            let responseData: any[] = [];
            if (Array.isArray(response.data)) {
              responseData = response.data;
            } else if (response.data && Array.isArray(response.data.campaigns)) {
              // BroadStreet API returns { campaigns: [...] }
              responseData = response.data.campaigns;
            } else if (response.data && Array.isArray(response.data.data)) {
              responseData = response.data.data;
            } else if (response.data && typeof response.data === 'object') {
              responseData = [response.data];
            }
            
            const advertiserCampaigns = responseData.map((camp: any) => ({
              ...camp,
              advertiserId: advertiser.id,
              networkId: advertiser.networkId
            }));
            allCampaigns.push(...advertiserCampaigns);
          } catch (error) {
            console.error(`Failed to fetch campaigns for advertiser ${advertiser.id}:`, error);
          }
        }
      }

      let created = 0;
      let updated = 0;

      // Process each campaign
      for (const apiCampaign of allCampaigns) {
        try {
          const existing = await campaignRepository.findById(apiCampaign.id);
          
          const campaignData = {
            name: apiCampaign.name || `Campaign ${apiCampaign.id}`,
            status: apiCampaign.status || 'active',
            startDate: apiCampaign.startDate ? new Date(apiCampaign.startDate) : undefined,
            endDate: apiCampaign.endDate ? new Date(apiCampaign.endDate) : undefined,
            budget: apiCampaign.budget || 0,
            spent: apiCampaign.spent || 0,
            impressions: apiCampaign.impressions || 0,
            clicks: apiCampaign.clicks || 0,
            ctr: apiCampaign.ctr || 0,
            advertiserId: apiCampaign.advertiserId,
            networkId: apiCampaign.networkId,
            updatedAt: new Date()
          };
          
          if (existing) {
            // Update existing campaign
            await campaignRepository.update(apiCampaign.id, campaignData);
            updated++;
          } else {
            // Create new campaign
            await campaignRepository.create({
              id: apiCampaign.id,
              ...campaignData
            });
            created++;
          }
        } catch (error) {
          console.error(`Failed to sync campaign ${apiCampaign.id}:`, error);
        }
      }

      console.log(`Campaigns sync completed: ${created} created, ${updated} updated`);
      return { processed: allCampaigns.length, created, updated };

    } catch (error) {
      console.error('Campaigns sync failed:', error);
      throw error;
    } finally {
      this.activeSyncs.delete(syncKey);
    }
  }

  /**
   * Sync advertisements (placeholder - API may not support this)
   */
  async syncAdvertisements(campaignId?: number): Promise<{ processed: number; created: number; updated: number }> {
    console.log('Advertisement sync not implemented - BroadStreet API may not support direct advertisement endpoints');
    return { processed: 0, created: 0, updated: 0 };
  }

  /**
   * Sync zones (placeholder - API may not support this)
   */
  async syncZones(networkId?: number): Promise<{ processed: number; created: number; updated: number }> {
    console.log('Zone sync not implemented - BroadStreet API may not support direct zone endpoints');
    return { processed: 0, created: 0, updated: 0 };
  }

  /**
   * Perform full synchronization of all entities
   */
  async performFullSync(): Promise<{
    networks: { processed: number; created: number; updated: number };
    advertisers: { processed: number; created: number; updated: number };
    campaigns: { processed: number; created: number; updated: number };
    advertisements: { processed: number; created: number; updated: number };
    zones: { processed: number; created: number; updated: number };
  }> {
    console.log('Starting full synchronization...');

    // Create sync metadata record
    const syncRecord = await syncMetadataRepository.createSyncRecord({
      entityType: EntityTypes.FULL,
      status: 'in_progress',
      startedAt: new Date(),
      recordsProcessed: 0,
      recordsUpdated: 0,
      recordsCreated: 0,
      recordsDeleted: 0,
      syncVersion: 1,
      triggeredBy: 'manual',
      metadata: {
        reason: 'Full synchronization',
        source: 'BroadStreet API'
      }
    });

    try {
      // Sync in order: Networks -> Advertisers -> Campaigns -> Advertisements -> Zones
      const networks = await this.syncNetworks();
      const advertisers = await this.syncAdvertisers();
      const campaigns = await this.syncCampaigns();
      const advertisements = await this.syncAdvertisements();
      const zones = await this.syncZones();

      const totalProcessed = networks.processed + advertisers.processed + campaigns.processed + advertisements.processed + zones.processed;
      const totalCreated = networks.created + advertisers.created + campaigns.created + advertisements.created + zones.created;
      const totalUpdated = networks.updated + advertisers.updated + campaigns.updated + advertisements.updated + zones.updated;

      // Update sync record with success
      await syncMetadataRepository.updateSyncStatus(
        (syncRecord._id as any).toString(),
        'completed',
        {
          recordsProcessed: totalProcessed,
          recordsCreated: totalCreated,
          recordsUpdated: totalUpdated,
          metadata: {
            ...syncRecord.metadata,
            results: { networks, advertisers, campaigns, advertisements, zones }
          }
        }
      );

      console.log('Full synchronization completed successfully');
      return { networks, advertisers, campaigns, advertisements, zones };

    } catch (error) {
      // Update sync record with failure
      await syncMetadataRepository.updateSyncStatus(
        (syncRecord._id as any).toString(),
        'failed',
        {
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        }
      );

      console.error('Full synchronization failed:', error);
      throw error;
    }
  }

  /**
   * Get active sync operations
   */
  getActiveSyncs(): string[] {
    return Array.from(this.activeSyncs);
  }

  /**
   * Check if any sync is currently active
   */
  isSyncActive(): boolean {
    return this.activeSyncs.size > 0;
  }

  /**
   * Cancel all active syncs (for testing/cleanup)
   */
  cancelAllSyncs(): void {
    this.activeSyncs.clear();
  }
}

// Export singleton instance
export const syncService = new SyncService();
export default syncService;