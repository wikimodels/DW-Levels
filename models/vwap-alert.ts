export interface VwapAlert {
  _id: string;
  id: string;
  creationTime?: number;
  activationTime?: number;
  activationTimeStr?: string;
  price?: number;
  high?: number;
  low?: number;
  tvScreensUrls?: string[];
  isActive: boolean;
  symbol: string;
  category?: string;
  tvLink?: string;
  cgLink?: string;
  exchanges?: string[];
  imageUrl?: string;
  anchorTime?: number;
  anchorPrice?: number;
  anchorTimeStr?: string;
}
