// Export all database models
export { default as Network, type INetwork } from './Network';
export { default as Advertiser, type IAdvertiser } from './Advertiser';
export { default as Campaign, type ICampaign } from './campaign';
export { default as Advertisement, type IAdvertisement } from './Advertisement';
export { default as Zone, type IZone } from './Zone';
export { default as SyncMetadata, type ISyncMetadata } from './SyncMetadata';

// Re-export existing models
export { default as CampaignData } from './campaignData';

// Model registry for dynamic access
export const ModelRegistry = {
  Network: () => require('./Network').default,
  Advertiser: () => require('./Advertiser').default,
  Campaign: () => require('./campaign').default,
  Advertisement: () => require('./Advertisement').default,
  Zone: () => require('./Zone').default,
  SyncMetadata: () => require('./SyncMetadata').default,
  CampaignData: () => require('./campaignData').default
};

// Entity type mapping for sync operations
export const EntityTypes = {
  NETWORKS: 'networks',
  ADVERTISERS: 'advertisers', 
  CAMPAIGNS: 'campaigns',
  ADVERTISEMENTS: 'advertisements',
  ZONES: 'zones',
  FULL: 'full'
} as const;

export type EntityType = typeof EntityTypes[keyof typeof EntityTypes];