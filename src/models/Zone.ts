import mongoose, { Schema, Document } from 'mongoose';

export interface IZone extends Document {
  id: number;
  name: string;
  networkId: number;
  type: string; // banner, text, video, etc.
  width?: number;
  height?: number;
  status: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
  // Sync metadata
  lastSyncAt: Date;
  syncVersion: number;
}

const ZoneSchema: Schema = new Schema({
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
  type: {
    type: String,
    required: true,
    enum: ['banner', 'text', 'video', 'native', 'popup', 'interstitial'],
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
  status: {
    type: String,
    required: true,
    enum: ['active', 'paused', 'inactive'],
    index: true
  },
  description: {
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
  collection: 'zones'
});

// Compound indexes for efficient queries
ZoneSchema.index({ networkId: 1, status: 1 });
ZoneSchema.index({ networkId: 1, type: 1 });
ZoneSchema.index({ type: 1, width: 1, height: 1 }); // Size-based queries
ZoneSchema.index({ networkId: 1, lastSyncAt: -1 });
ZoneSchema.index({ id: 1, syncVersion: 1 });
ZoneSchema.index({ name: 'text' }); // Text search on zone names

export default mongoose.models.Zone || mongoose.model<IZone>('Zone', ZoneSchema);