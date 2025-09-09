import mongoose, { Schema, Document } from 'mongoose';

export interface IAdvertiser extends Document {
  id: number;
  name: string;
  networkId: number;
  status: string;
  email?: string;
  phone?: string;
  createdAt?: Date;
  updatedAt?: Date;
  // Sync metadata
  lastSyncAt: Date;
  syncVersion: number;
}

const AdvertiserSchema: Schema = new Schema({
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
  networkId: {
    type: Number,
    required: true,
    ref: 'Network',
    index: true
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'paused', 'inactive'],
    index: true
  },
  email: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
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
  collection: 'advertisers'
});

// Compound indexes for efficient queries
AdvertiserSchema.index({ networkId: 1, status: 1 });
AdvertiserSchema.index({ networkId: 1, lastSyncAt: -1 });
AdvertiserSchema.index({ id: 1, syncVersion: 1 });
AdvertiserSchema.index({ name: 'text' }); // Text search on advertiser names

export default mongoose.models.Advertiser || mongoose.model<IAdvertiser>('Advertiser', AdvertiserSchema);