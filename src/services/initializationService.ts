import { ISyncMetadata } from '../models/SyncMetadata';
import { isDatabaseEmpty, initializeDatabase } from '../lib/mongodb';
import { syncMetadataRepository } from '../lib/database-repository';
import campaignService from './campaignService';
import { EntityTypes } from '../models';

/**
 * Service responsible for initializing the local database
 * with data from BroadStreet API on first run
 */
class InitializationService {
  private isInitializing = false;
  private initializationPromise: Promise<void> | null = null;

  /**
   * Check if initialization is needed and perform it
   */
  async ensureInitialized(): Promise<void> {
    // Return existing promise if initialization is in progress
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    // Check if database is empty
    const isEmpty = await isDatabaseEmpty();
    if (!isEmpty) {
      console.log('Database already initialized, skipping initialization');
      return;
    }

    // Start initialization
    this.initializationPromise = this.performInitialization();
    return this.initializationPromise;
  }

  /**
   * Force initialization regardless of database state
   */
  async forceInitialization(): Promise<void> {
    this.initializationPromise = this.performInitialization();
    return this.initializationPromise;
  }

  /**
   * Perform the actual initialization process
   */
  private async performInitialization(): Promise<void> {
    if (this.isInitializing) {
      throw new Error('Initialization already in progress');
    }

    this.isInitializing = true;
    console.log('Starting database initialization...');

    try {
      // Initialize database schema and indexes
      await initializeDatabase();

      // Create sync metadata record for initialization
            const syncRecord = await syncMetadataRepository.createSyncRecord({
        entityType: EntityTypes.FULL,
        status: 'in_progress',
        startedAt: new Date(),
        recordsProcessed: 0,
        recordsUpdated: 0,
        recordsCreated: 0,
        recordsDeleted: 0,
        syncVersion: 1,
        triggeredBy: 'initialization',
        metadata: {
          reason: 'Initial database setup',
          source: 'BroadStreet API'
        }
      }) as ISyncMetadata;

      console.log('Sync record created:', syncRecord._id);

      // Perform full data sync
      const syncResult = await this.performFullSync();

      // Update sync record with results
      await syncMetadataRepository.updateSyncStatus(
        (syncRecord._id as any).toString(),
        'completed',
        {
          recordsProcessed: syncResult.totalProcessed,
          recordsCreated: syncResult.totalCreated,
          recordsUpdated: syncResult.totalUpdated,
          metadata: {
            ...syncRecord.metadata,
            syncResult,
            completedAt: new Date()
          }
        }
      );

      console.log('Database initialization completed successfully');
      console.log('Sync results:', syncResult);

    } catch (error) {
      console.error('Database initialization failed:', error);
      
      // Try to update sync record with error
      try {
        const activeSyncs = await syncMetadataRepository.getActiveSyncs();
        const currentSync = activeSyncs.find(s => s.triggeredBy === 'initialization');
        if (currentSync) {
          await syncMetadataRepository.updateSyncStatus(
            (currentSync._id as any).toString(),
            'failed',
            {
              errorMessage: error instanceof Error ? error.message : 'Unknown error'
            }
          );
        }
      } catch (updateError) {
        console.error('Failed to update sync record with error:', updateError);
      }
      
      throw error;
    } finally {
      this.isInitializing = false;
      this.initializationPromise = null;
    }
  }

  /**
   * Perform full synchronization with BroadStreet API
   */
  private async performFullSync(): Promise<{
    totalProcessed: number;
    totalCreated: number;
    totalUpdated: number;
    networks: number;
    advertisers: number;
    campaigns: number;
    advertisements: number;
    zones: number;
  }> {
    console.log('Starting full sync with BroadStreet API...');

    const results = {
      totalProcessed: 0,
      totalCreated: 0,
      totalUpdated: 0,
      networks: 0,
      advertisers: 0,
      campaigns: 0,
      advertisements: 0,
      zones: 0
    };

    try {
      // Import the sync service dynamically to avoid circular dependencies
      const { syncService } = await import('./syncService');

      // Sync networks first (they're the foundation)
      console.log('Syncing networks...');
      const networkResult = await syncService.syncNetworks();
      results.networks = networkResult.created + networkResult.updated;
      results.totalCreated += networkResult.created;
      results.totalUpdated += networkResult.updated;
      results.totalProcessed += networkResult.processed;

      // Sync advertisers for each network
      console.log('Syncing advertisers...');
      const advertiserResult = await syncService.syncAdvertisers();
      results.advertisers = advertiserResult.created + advertiserResult.updated;
      results.totalCreated += advertiserResult.created;
      results.totalUpdated += advertiserResult.updated;
      results.totalProcessed += advertiserResult.processed;

      // Sync campaigns
      console.log('Syncing campaigns...');
      const campaignResult = await syncService.syncCampaigns();
      results.campaigns = campaignResult.created + campaignResult.updated;
      results.totalCreated += campaignResult.created;
      results.totalUpdated += campaignResult.updated;
      results.totalProcessed += campaignResult.processed;

      // Sync advertisements (if API supports it)
      console.log('Syncing advertisements...');
      try {
        const advertisementResult = await syncService.syncAdvertisements();
        results.advertisements = advertisementResult.created + advertisementResult.updated;
        results.totalCreated += advertisementResult.created;
        results.totalUpdated += advertisementResult.updated;
        results.totalProcessed += advertisementResult.processed;
      } catch (error) {
        console.warn('Advertisement sync failed (may not be supported by API):', error);
      }

      // Sync zones (if API supports it)
      console.log('Syncing zones...');
      try {
        const zoneResult = await syncService.syncZones();
        results.zones = zoneResult.created + zoneResult.updated;
        results.totalCreated += zoneResult.created;
        results.totalUpdated += zoneResult.updated;
        results.totalProcessed += zoneResult.processed;
      } catch (error) {
        console.warn('Zone sync failed (may not be supported by API):', error);
      }

      console.log('Full sync completed:', results);
      return results;

    } catch (error) {
      console.error('Full sync failed:', error);
      throw error;
    }
  }

  /**
   * Check initialization status
   */
  async getInitializationStatus(): Promise<{
    isInitialized: boolean;
    isInitializing: boolean;
    lastInitialization?: Date;
    recordCount: {
      networks: number;
      advertisers: number;
      campaigns: number;
      advertisements: number;
      zones: number;
    };
  }> {
    const isEmpty = await isDatabaseEmpty();
    
    // Get record counts
    const { 
      networkRepository, 
      advertiserRepository, 
      campaignRepository,
      advertisementRepository,
      zoneRepository
    } = await import('../lib/database-repository');

    const [networks, advertisers, campaigns, advertisements, zones] = await Promise.all([
      networkRepository.count(),
      advertiserRepository.count(),
      campaignRepository.count(),
      advertisementRepository.count(),
      zoneRepository.count()
    ]);

    // Get last initialization sync
    const lastSync = await syncMetadataRepository.getLatestSync(EntityTypes.FULL);

    return {
      isInitialized: !isEmpty,
      isInitializing: this.isInitializing,
      lastInitialization: lastSync?.completedAt,
      recordCount: {
        networks,
        advertisers,
        campaigns,
        advertisements,
        zones
      }
    };
  }

  /**
   * Reset initialization state (for testing)
   */
  resetState(): void {
    this.isInitializing = false;
    this.initializationPromise = null;
  }
}

// Export singleton instance
export const initializationService = new InitializationService();
export default initializationService;