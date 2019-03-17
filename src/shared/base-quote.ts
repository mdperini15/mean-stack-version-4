export interface BaseQuote {
  orderId: string;
  symbol: string;
  timeStamp: string;
  lp: string;
  bidPrice: number;
  bidQuantity: number;
  askPrice: number;
  askQuantity: number;
}

export interface BaseQuoteStr {
  orderId: string;
  symbol: string;
  timeStamp: string;
  lp: string;
  bidPrice: string;
  bidQuantity: string;
  askPrice: string;
  askQuantity: string;
}
