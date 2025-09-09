import { NextRequest, NextResponse } from 'next/server';
import { syncMetadataRepository } from '@/lib/database-repository';
import { syncService } from '@/services/syncService';
import { initializationService } from '@/services/initializationService';
import { EntityTypes } from '@/models';

export async function GET(request: NextRequest) {
  try {
    // Get initialization status
    const initStatus = await initializationService.getInitializationStatus();
    
    // Get active syncs
    const activeSyncs = await syncMetadataRepository.getActiveSyncs();
    
    // Get latest completed sync
    const latestSync = await syncMetadataRepository.getLatestSync(EntityTypes.FULL);
    
    // Check if any sync is currently active
    const isActive = syncService.isSyncActive() || activeSyncs.length > 0;
    
    // Get sync history (last 10 syncs)
    const syncHistory = await syncMetadataRepository.findAll(
      { status: { $in: ['completed', 'failed'] } },
      { 
        sort: { completedAt: -1 }, 
        limit: 10 
      }
    );

    return NextResponse.json({
      isActive,
      isInitialized: initStatus.isInitialized,
      isInitializing: initStatus.isInitializing,
      lastSync: latestSync?.completedAt,
      lastSyncStatus: latestSync?.status,
      activeSyncs: activeSyncs.map(sync => ({
        id: sync._id,
        entityType: sync.entityType,
        entityId: sync.entityId,
        status: sync.status,
        startedAt: sync.startedAt,
        triggeredBy: sync.triggeredBy,
        recordsProcessed: sync.recordsProcessed
      })),
      syncHistory: syncHistory.map(sync => ({
        id: sync._id,
        entityType: sync.entityType,
        status: sync.status,
        startedAt: sync.startedAt,
        completedAt: sync.completedAt,
        recordsProcessed: sync.recordsProcessed,
        recordsCreated: sync.recordsCreated,
        recordsUpdated: sync.recordsUpdated,
        triggeredBy: sync.triggeredBy,
        errorMessage: sync.errorMessage,
        duration: sync.completedAt ? sync.completedAt.getTime() - sync.startedAt.getTime() : null
      })),
      recordCounts: initStatus.recordCount,
      error: null
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching sync status:', error);
    
    return NextResponse.json({
      isActive: false,
      isInitialized: false,
      isInitializing: false,
      lastSync: null,
      lastSyncStatus: null,
      activeSyncs: [],
      syncHistory: [],
      recordCounts: {
        networks: 0,
        advertisers: 0,
        campaigns: 0,
        advertisements: 0,
        zones: 0
      },
      error: error instanceof Error ? error.message : 'Failed to fetch sync status'
    }, { status: 500 });
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}