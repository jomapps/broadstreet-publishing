import mongoose, { Schema, Document } from 'mongoose';

export interface IAdvertisement extends Document {
  id: number;
  name: string;
  campaignId: number;
  advertiserId: number;
  networkId: number;
  type: string; // banner, text, video, etc.
  status: string;
  width?: number;
  height?: number;
  createdAt?: Date;
  updatedAt?: Date;
  // Sync metadata
  lastSyncAt: Date;
  syncVersion: number;
}

const AdvertisementSchema: Schema = new Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    index: true
  },
  campaignId: {
    type: Number,
    required: true,
    ref: 'Campaign',
    index: true
  },
  advertiserId: {
    type: Number,
    required: true,
    ref: 'Advertiser',
    index: true
  },
  networkId: {
    type: Number,
    required: true,
    ref: 'Network',
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['banner', 'text', 'video', 'native', 'popup', 'interstitial'],
    index: true
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'paused', 'inactive', 'pending'],
    index: true
  },
  width: {
    type: Number,
    min: 0
  },
  height: {
    type: Number,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  // Sync metadata for tracking data freshness
  lastSyncAt: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  syncVersion: {
    type: Number,
    required: true,
    default: 1
  }
}, {
  timestamps: true,
  collection: 'advertisements'
});

// Compound indexes for efficient queries
AdvertisementSchema.index({ campaignId: 1, status: 1 });
AdvertisementSchema.index({ advertiserId: 1, status: 1 });
AdvertisementSchema.index({ networkId: 1, type: 1 });
AdvertisementSchema.index({ networkId: 1, lastSyncAt: -1 });
AdvertisementSchema.index({ id: 1, syncVersion: 1 });
AdvertisementSchema.index({ name: 'text' }); // Text search on advertisement names
AdvertisementSchema.index({ type: 1, width: 1, height: 1 }); // Size-based queries

export default mongoose.models.Advertisement || mongoose.model<IAdvertisement>('Advertisement', AdvertisementSchema);