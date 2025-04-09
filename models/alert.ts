export interface Alert {
  _id?: string;
  id: string;
  action: string;
  alertName: string;
  description?: string;
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
  status: string;
  tvLink?: string;
  cgLink?: string;
  exchanges?: string[];
  imageUrl?: string;
}
