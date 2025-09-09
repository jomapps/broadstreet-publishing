import mongoose, { Document, Schema } from 'mongoose';

export interface ICampaign extends Document {
  id: number;
  name: string;
  status: string;
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  spent?: number;
  impressions?: number;
  clicks?: number;
  ctr?: number;
  advertiserId?: number;
  networkId?: number;
  createdAt: Date;
  updatedAt: Date;
  // Sync metadata
  lastSyncAt: Date;
  syncVersion: number;
}

const CampaignSchema: Schema = new Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    status: {
      type: String,
      required: true,
      enum: ['active', 'paused', 'completed', 'draft', 'inactive'],
      default: 'draft',
      index: true
    },
    startDate: {
      type: Date,
      required: false,
      index: true
    },
    endDate: {
      type: Date,
      required: false,
      index: true
    },
    budget: {
      type: Number,
      default: 0,
      min: 0
    },
    spent: {
      type: Number,
      default: 0,
      min: 0
    },
    impressions: {
      type: Number,
      default: 0,
      min: 0
    },
    clicks: {
      type: Number,
      default: 0,
      min: 0
    },
    ctr: {
      type: Number,
      default: 0,
      min: 0
    },
    advertiserId: {
      type: Number,
      ref: 'Advertiser',
      index: true
    },
    networkId: {
      type: Number,
      ref: 'Network',
      index: true
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
  },
  {
    timestamps: true,
    collection: 'campaigns'
  }
);

// Compound indexes for efficient queries
CampaignSchema.index({ networkId: 1, status: 1 });
CampaignSchema.index({ advertiserId: 1, status: 1 });
CampaignSchema.index({ status: 1, startDate: -1 });
CampaignSchema.index({ networkId: 1, lastSyncAt: -1 });
CampaignSchema.index({ id: 1, syncVersion: 1 });
CampaignSchema.index({ name: 'text' }); // Text search on campaign names

// Prevent re-compilation during development
export default mongoose.models.Campaign || mongoose.model<ICampaign>('Campaign', CampaignSchema);
