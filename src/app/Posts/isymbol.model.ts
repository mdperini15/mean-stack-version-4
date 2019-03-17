export interface ISymbol {
  id: string;
  symbol: string;
  count: number;
  bidQuantity: number;
  askQuantity: number;
}

export interface ISymbolTotals {
  symbol: number;
  count: number;
  bidQuantity: number;
  askQuantity: number;
}
