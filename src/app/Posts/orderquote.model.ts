export interface OrderQuote {
  id: string;
  symbol: string;
  timeStamp: string;
  lp: string;
  bidPrice: number;
  bidQuantity: number;
  askPrice: number;
  askQuantity: number;
}
