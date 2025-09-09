import { NextRequest, NextResponse } from 'next/server';
import { syncService } from '@/services/syncService';
import { initializationService } from '@/services/initializationService';
import { syncMetadataRepository } from '@/lib/database-repository';
import { EntityTypes } from '@/models';

interface TriggerSyncRequest {
  type: 'full' | 'networks' | 'advertisers' | 'campaigns' | 'advertisements' | 'zones';
  entityId?: number;
  force?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: TriggerSyncRequest = await request.json();
    const { type, entityId, force = false } = body;

    // Validate request
    if (!type) {
      return NextResponse.json(
        { error: 'Sync type is required' },
        { status: 400 }
      );
    }

    // Check if sync is already active (unless forced)
    if (!force && syncService.isSyncActive()) {
      const activeSyncs = syncService.getActiveSyncs();
      return NextResponse.json(
        { 
          error: 'Sync already in progress',
          activeSyncs 
        },
        { status: 409 }
      );
    }

    let syncResult: any;
    let syncRecord: any;

    try {
      // Create sync metadata record
      syncRecord = await syncMetadataRepository.createSyncRecord({
        entityType: type === 'full' ? EntityTypes.FULL : type,
        entityId,
        status: 'in_progress',
        startedAt: new Date(),
        recordsProcessed: 0,
        recordsUpdated: 0,
        recordsCreated: 0,
        recordsDeleted: 0,
        syncVersion: 1,
        triggeredBy: 'manual',
        metadata: {
          reason: `Manual ${type} sync`,
          source: 'BroadStreet API',
          force
        }
      });

      // Perform the requested sync operation
      switch (type) {
        case 'full':
          syncResult = await syncService.performFullSync();
          break;
        
        case 'networks':
          syncResult = await syncService.syncNetworks();
          break;
        
        case 'advertisers':
          syncResult = await syncService.syncAdvertisers(entityId);
          break;
        
        case 'campaigns':
          syncResult = await syncService.syncCampaigns(entityId);
          break;
        
        case 'advertisements':
          syncResult = await syncService.syncAdvertisements(entityId);
          break;
        
        case 'zones':
          syncResult = await syncService.syncZones(entityId);
          break;
        
        default:
          throw new Error(`Unsupported sync type: ${type}`);
      }

      // Calculate totals for full sync
      let totalProcessed = 0;
      let totalCreated = 0;
      let totalUpdated = 0;

      if (type === 'full' && syncResult) {
        totalProcessed = Object.values(syncResult).reduce((sum: number, result: any) => sum + (result.processed || 0), 0);
        totalCreated = Object.values(syncResult).reduce((sum: number, result: any) => sum + (result.created || 0), 0);
        totalUpdated = Object.values(syncResult).reduce((sum: number, result: any) => sum + (result.updated || 0), 0);
      } else if (syncResult) {
        totalProcessed = syncResult.processed || 0;
        totalCreated = syncResult.created || 0;
        totalUpdated = syncResult.updated || 0;
      }

      // Update sync record with success
      await syncMetadataRepository.updateSyncStatus(
        syncRecord._id.toString(),
        'completed',
        {
          recordsProcessed: totalProcessed,
          recordsCreated: totalCreated,
          recordsUpdated: totalUpdated,
          metadata: {
            ...syncRecord.metadata,
            result: syncResult
          }
        }
      );

      return NextResponse.json({
        success: true,
        syncId: syncRecord._id,
        type,
        entityId,
        result: syncResult,
        summary: {
          processed: totalProcessed,
          created: totalCreated,
          updated: totalUpdated
        },
        startedAt: syncRecord.startedAt,
        completedAt: new Date()
      }, { status: 200 });

    } catch (syncError) {
      // Update sync record with failure if it was created
      if (syncRecord) {
        await syncMetadataRepository.updateSyncStatus(
          syncRecord._id.toString(),
          'failed',
          {
            errorMessage: syncError instanceof Error ? syncError.message : 'Unknown sync error'
          }
        );
      }
      
      throw syncError;
    }

  } catch (error) {
    console.error('Sync trigger error:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('already in progress')) {
        return NextResponse.json(
          { error: 'Sync already in progress' },
          { status: 409 }
        );
      }
      
      if (error.message.includes('Rate limit')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
      
      if (error.message.includes('Authentication')) {
        return NextResponse.json(
          { error: 'Authentication failed. Please check API configuration.' },
          { status: 401 }
        );
      }
    }
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Sync failed',
        type: 'sync_error'
      },
      { status: 500 }
    );
  }
}

// Handle GET requests to show available sync types
export async function GET(request: NextRequest) {
  return NextResponse.json({
    availableTypes: [
      {
        type: 'full',
        description: 'Synchronize all data from BroadStreet API',
        supportsEntityId: false
      },
      {
        type: 'networks',
        description: 'Synchronize networks only',
        supportsEntityId: false
      },
      {
        type: 'advertisers',
        description: 'Synchronize advertisers',
        supportsEntityId: true,
        entityIdDescription: 'Network ID to sync advertisers for (optional)'
      },
      {
        type: 'campaigns',
        description: 'Synchronize campaigns',
        supportsEntityId: true,
        entityIdDescription: 'Advertiser ID to sync campaigns for (optional)'
      },
      {
        type: 'advertisements',
        description: 'Synchronize advertisements (if supported by API)',
        supportsEntityId: true,
        entityIdDescription: 'Campaign ID to sync advertisements for (optional)'
      },
      {
        type: 'zones',
        description: 'Synchronize zones (if supported by API)',
        supportsEntityId: true,
        entityIdDescription: 'Network ID to sync zones for (optional)'
      }
    ],
    currentStatus: {
      isActive: syncService.isSyncActive(),
      activeSyncs: syncService.getActiveSyncs()
    }
  }, { status: 200 });
}

// Handle OPTIONS for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}