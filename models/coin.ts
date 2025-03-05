export interface Coin {
  symbol: string;
  category: string;
  exchanges: string[];
  imageUrl: string;
  isAtWork?: boolean;
}
