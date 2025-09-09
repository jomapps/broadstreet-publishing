export interface Campaign {
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
}

export interface CampaignData {
  campaignId: number;
  impressions: number;
  clicks: number;
  ctr: number;
  spend: number;
}

export interface Network {
  id: number;
  name: string;
  description?: string;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Advertiser {
  id: number;
  name: string;
  networkId: number;
  status: string;
  email?: string;
  phone?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Advertisement {
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
}

export interface Zone {
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
}

export interface DashboardSummary {
  networks: {
    total: number;
    active: number;
  };
  advertisers: {
    total: number;
    active: number;
  };
  campaigns: {
    total: number;
    active: number;
    paused: number;
    totalSpend: number;
    totalImpressions: number;
    totalClicks: number;
  };
  advertisements: {
    total: number;
    active: number;
  };
  zones: {
    total: number;
    active: number;
  };
}

export interface BroadstreetApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}
