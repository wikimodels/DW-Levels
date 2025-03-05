export interface KlineData {
  symbol: string;
  category: string;
  exchanges: string[];
  imageUrl: string;
  openTime: number;
  closeTime: number;
  openPrice: number;
  highPrice: number;
  closePrice: number;
  lowPrice: number;
  baseVolume: number;
  quoteVolume: number;
}
