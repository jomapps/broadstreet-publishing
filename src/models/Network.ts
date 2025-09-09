import mongoose, { Schema, Document } from 'mongoose';

export interface INetwork extends Document {
  id: number;
  name: string;
  description?: string;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
  // Sync metadata
  lastSyncAt: Date;
  syncVersion: number;
}

const NetworkSchema: Schema = new Schema({
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
  description: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'paused', 'inactive'],
    index: true
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
  collection: 'networks'
});

// Compound indexes for efficient queries
NetworkSchema.index({ status: 1, lastSyncAt: -1 });
NetworkSchema.index({ id: 1, syncVersion: 1 });

export default mongoose.models.Network || mongoose.model<INetwork>('Network', NetworkSchema);