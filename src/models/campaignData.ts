import mongoose, { Document, Schema } from 'mongoose';

export interface ICampaignData extends Document {
  campaignId: number;
  impressions: number;
  clicks: number;
  ctr: number;
  spend: number;
  createdAt: Date;
  updatedAt: Date;
}

const CampaignDataSchema: Schema = new Schema(
  {
    campaignId: {
      type: Number,
      required: true,
      unique: true,
    },
    impressions: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    clicks: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    ctr: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    spend: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent re-compilation during development
export default mongoose.models.CampaignData || mongoose.model<ICampaignData>('CampaignData', CampaignDataSchema);
