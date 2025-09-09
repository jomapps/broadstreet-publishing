import dbConnect from './mongodb';
import { 
  Network, Advertiser, Campaign, Advertisement, Zone, SyncMetadata,
  type INetwork, type IAdvertiser, type ICampaign, 
  type IAdvertisement, type IZone, type ISyncMetadata 
} from '../models';

/**
 * Base repository class with common CRUD operations
 */
class BaseRepository<T> {
  protected model: any;

  constructor(model: any) {
    this.model = model;
  }

  async findById(id: number): Promise<T | null> {
    await dbConnect();
    return await this.model.findOne({ id }).lean();
  }

  async findAll(filter: any = {}, options: any = {}): Promise<T[]> {
    await dbConnect();
    return await this.model.find(filter, null, options).lean();
  }

  async create(data: Partial<T>): Promise<T> {
    await dbConnect();
    const doc = new this.model({
      ...data,
      lastSyncAt: new Date(),
      syncVersion: 1
    });
    return await doc.save();
  }

  async update(id: number, data: Partial<T>): Promise<T | null> {
    await dbConnect();
    return await this.model.findOneAndUpdate(
      { id },
      { 
        ...data, 
        lastSyncAt: new Date(),
        syncVersion: { $inc: 1 }
      },
      { new: true, lean: true }
    );
  }

  async upsert(id: number, data: Partial<T>): Promise<T> {
    await dbConnect();
    return await this.model.findOneAndUpdate(
      { id },
      { 
        ...data,
        id,
        lastSyncAt: new Date(),
        $inc: { syncVersion: 1 }
      },
      { 
        new: true, 
        upsert: true, 
        lean: true,
        setDefaultsOnInsert: true
      }
    );
  }

  async delete(id: number): Promise<boolean> {
    await dbConnect();
    const result = await this.model.deleteOne({ id });
    return result.deletedCount > 0;
  }

  async count(filter: any = {}): Promise<number> {
    await dbConnect();
    return await this.model.countDocuments(filter);
  }

  async getLastSyncTime(): Promise<Date | null> {
    await dbConnect();
    const doc = await this.model.findOne({}, { lastSyncAt: 1 }).sort({ lastSyncAt: -1 }).lean();
    return doc?.lastSyncAt || null;
  }
}

/**
 * Network repository with specific methods
 */
class NetworkRepository extends BaseRepository<INetwork> {
  constructor() {
    super(Network);
  }

  async getActiveNetworks(): Promise<INetwork[]> {
    return await this.findAll({ status: 'active' }, { sort: { name: 1 } });
  }

  async getNetworkStats(): Promise<{ total: number; active: number }> {
    const [total, active] = await Promise.all([
      this.count(),
      this.count({ status: 'active' })
    ]);
    return { total, active };
  }
}

/**
 * Advertiser repository with network relationships
 */
class AdvertiserRepository extends BaseRepository<IAdvertiser> {
  constructor() {
    super(Advertiser);
  }

  async getByNetworkId(networkId: number): Promise<IAdvertiser[]> {
    return await this.findAll({ networkId }, { sort: { name: 1 } });
  }

  async getActiveAdvertisers(networkId?: number): Promise<IAdvertiser[]> {
    const filter: any = { status: 'active' };
    if (networkId) filter.networkId = networkId;
    return await this.findAll(filter, { sort: { name: 1 } });
  }

  async getAdvertiserStats(networkId?: number): Promise<{ total: number; active: number }> {
    const baseFilter = networkId ? { networkId } : {};
    const [total, active] = await Promise.all([
      this.count(baseFilter),
      this.count({ ...baseFilter, status: 'active' })
    ]);
    return { total, active };
  }
}

/**
 * Campaign repository with advanced filtering
 */
class CampaignRepository extends BaseRepository<ICampaign> {
  constructor() {
    super(Campaign);
  }

  async getByNetworkId(networkId: number): Promise<ICampaign[]> {
    return await this.findAll({ networkId }, { sort: { startDate: -1 } });
  }

  async getByAdvertiserId(advertiserId: number): Promise<ICampaign[]> {
    return await this.findAll({ advertiserId }, { sort: { startDate: -1 } });
  }

  async getActiveCampaigns(networkId?: number): Promise<ICampaign[]> {
    const filter: any = { status: 'active' };
    if (networkId) filter.networkId = networkId;
    return await this.findAll(filter, { sort: { startDate: -1 } });
  }

  async getCampaignStats(networkId?: number): Promise<{
    total: number;
    active: number;
    paused: number;
    totalSpend: number;
    totalImpressions: number;
    totalClicks: number;
  }> {
    await dbConnect();
    const baseFilter = networkId ? { networkId } : {};
    
    const [stats] = await this.model.aggregate([
      { $match: baseFilter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          paused: { $sum: { $cond: [{ $eq: ['$status', 'paused'] }, 1, 0] } },
          totalSpend: { $sum: { $ifNull: ['$spent', 0] } },
          totalImpressions: { $sum: { $ifNull: ['$impressions', 0] } },
          totalClicks: { $sum: { $ifNull: ['$clicks', 0] } }
        }
      }
    ]);

    return stats || {
      total: 0,
      active: 0,
      paused: 0,
      totalSpend: 0,
      totalImpressions: 0,
      totalClicks: 0
    };
  }

  async searchCampaigns(query: string, networkId?: number): Promise<ICampaign[]> {
    await dbConnect();
    const filter: any = {
      $text: { $search: query }
    };
    if (networkId) filter.networkId = networkId;
    
    return await this.model.find(filter, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .lean();
  }
}

/**
 * Advertisement repository
 */
class AdvertisementRepository extends BaseRepository<IAdvertisement> {
  constructor() {
    super(Advertisement);
  }

  async getByCampaignId(campaignId: number): Promise<IAdvertisement[]> {
    return await this.findAll({ campaignId }, { sort: { name: 1 } });
  }

  async getByNetworkId(networkId: number): Promise<IAdvertisement[]> {
    return await this.findAll({ networkId }, { sort: { name: 1 } });
  }

  async getAdvertisementStats(networkId?: number): Promise<{ total: number; active: number }> {
    const baseFilter = networkId ? { networkId } : {};
    const [total, active] = await Promise.all([
      this.count(baseFilter),
      this.count({ ...baseFilter, status: 'active' })
    ]);
    return { total, active };
  }
}

/**
 * Zone repository
 */
class ZoneRepository extends BaseRepository<IZone> {
  constructor() {
    super(Zone);
  }

  async getByNetworkId(networkId: number): Promise<IZone[]> {
    return await this.findAll({ networkId }, { sort: { name: 1 } });
  }

  async getZoneStats(networkId?: number): Promise<{ total: number; active: number }> {
    const baseFilter = networkId ? { networkId } : {};
    const [total, active] = await Promise.all([
      this.count(baseFilter),
      this.count({ ...baseFilter, status: 'active' })
    ]);
    return { total, active };
  }
}

/**
 * Sync metadata repository
 */
class SyncMetadataRepository extends BaseRepository<ISyncMetadata> {
  constructor() {
    super(SyncMetadata);
  }

  async getLatestSync(entityType: string, entityId?: number): Promise<ISyncMetadata | null> {
    const filter: any = { entityType, status: 'completed' };
    if (entityId) filter.entityId = entityId;
    
    return await this.model.findOne(filter).sort({ completedAt: -1 }).lean();
  }

  async getActiveSyncs(): Promise<ISyncMetadata[]> {
    return await this.findAll(
      { status: { $in: ['pending', 'in_progress'] } },
      { sort: { startedAt: -1 } }
    );
  }

  async createSyncRecord(data: Partial<ISyncMetadata>): Promise<ISyncMetadata> {
    await dbConnect();
    const doc = new this.model(data);
    return await doc.save();
  }

  async updateSyncStatus(
    id: string, 
    status: 'completed' | 'failed', 
    data: Partial<ISyncMetadata> = {}
  ): Promise<ISyncMetadata | null> {
    await dbConnect();
    return await this.model.findByIdAndUpdate(
      id,
      {
        ...data,
        status,
        completedAt: new Date()
      },
      { new: true, lean: true }
    );
  }
}

// Export repository instances
export const networkRepository = new NetworkRepository();
export const advertiserRepository = new AdvertiserRepository();
export const campaignRepository = new CampaignRepository();
export const advertisementRepository = new AdvertisementRepository();
export const zoneRepository = new ZoneRepository();
export const syncMetadataRepository = new SyncMetadataRepository();

// Export repository classes for testing
export {
  NetworkRepository,
  AdvertiserRepository,
  CampaignRepository,
  AdvertisementRepository,
  ZoneRepository,
  SyncMetadataRepository
};