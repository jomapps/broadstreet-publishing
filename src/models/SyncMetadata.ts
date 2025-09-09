import mongoose, { Schema, Document } from 'mongoose';

export interface ISyncMetadata extends Document {
  entityType: 'networks' | 'advertisers' | 'campaigns' | 'advertisements' | 'zones' | 'full';
  entityId?: number; // Optional for targeted syncs
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  recordsProcessed: number;
  recordsUpdated: number;
  recordsCreated: number;
  recordsDeleted: number;
  errorMessage?: string;
  syncVersion: number;
  triggeredBy: 'manual' | 'auto' | 'initialization' | 'workflow';
  metadata?: any; // Additional sync-specific data
}

const SyncMetadataSchema: Schema = new Schema({
  entityType: {
    type: String,
    required: true,
    enum: ['networks', 'advertisers', 'campaigns', 'advertisements', 'zones', 'full'],
    index: true
  },
  entityId: {
    type: Number,
    index: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'in_progress', 'completed', 'failed'],
    default: 'pending',
    index: true
  },
  startedAt: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  completedAt: {
    type: Date,
    index: true
  },
  recordsProcessed: {
    type: Number,
    default: 0,
    min: 0
  },
  recordsUpdated: {
    type: Number,
    default: 0,
    min: 0
  },
  recordsCreated: {
    type: Number,
    default: 0,
    min: 0
  },
  recordsDeleted: {
    type: Number,
    default: 0,
    min: 0
  },
  errorMessage: {
    type: String,
    default: ''
  },
  syncVersion: {
    type: Number,
    required: true,
    default: 1
  },
  triggeredBy: {
    type: String,
    required: true,
    enum: ['manual', 'auto', 'initialization', 'workflow'],
    index: true
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  collection: 'sync_metadata'
});

// Compound indexes for efficient queries
SyncMetadataSchema.index({ entityType: 1, status: 1 });
SyncMetadataSchema.index({ status: 1, startedAt: -1 });
SyncMetadataSchema.index({ entityType: 1, entityId: 1, startedAt: -1 });
SyncMetadataSchema.index({ triggeredBy: 1, startedAt: -1 });

// Method to calculate sync duration
SyncMetadataSchema.methods.getDuration = function() {
  if (!this.completedAt) return null;
  return this.completedAt.getTime() - this.startedAt.getTime();
};

// Static method to get latest sync for entity type
SyncMetadataSchema.statics.getLatestSync = function(entityType: string, entityId?: number) {
  const query: any = { entityType, status: 'completed' };
  if (entityId) query.entityId = entityId;
  
  return this.findOne(query).sort({ completedAt: -1 });
};

export default mongoose.models.SyncMetadata || mongoose.model<ISyncMetadata>('SyncMetadata', SyncMetadataSchema);